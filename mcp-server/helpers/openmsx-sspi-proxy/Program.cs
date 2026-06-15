using System.Net.Security;
using System.Net.Sockets;

namespace McpOpenMsx.SspiProxy;

/// <summary>
/// stdio ↔ openMSX TCP+SSPI proxy for Windows.
///
/// mcp-openmsx launches this helper with the openMSX control port as its only
/// argument. The proxy connects to 127.0.0.1:&lt;port&gt;, performs the SSPI
/// (Negotiate/NTLM) handshake openMSX has required since 0.7.1, and then forwards
/// raw bytes in both directions:
///
///     stdin  → openMSX   (XML commands from mcp-openmsx)
///     openMSX → stdout   (XML output back to mcp-openmsx)
///
/// stdout carries ONLY openMSX bytes — no banners, no logs. All diagnostics go
/// to stderr. The proxy never sends &lt;openmsx-control&gt; itself; mcp-openmsx
/// drives the XML session exactly as it does on Linux/macOS.
/// </summary>
internal static class Program
{
    private static async Task<int> Main(string[] args)
    {
        if (args.Length != 1 || !int.TryParse(args[0], out var openmsxPort) || openmsxPort <= 0 || openmsxPort > 65535)
        {
            Console.Error.WriteLine("Usage: mcp-openmsx-sspi-proxy <openmsx-port>");
            return 2;
        }

        try
        {
            using var openMsxClient = new TcpClient();
            await openMsxClient.ConnectAsync("127.0.0.1", openmsxPort).ConfigureAwait(false);
            await using var openMsxStream = openMsxClient.GetStream();

            DoSspiHandshake(openMsxStream);
            Console.Error.WriteLine("[mcp-openmsx-sspi-proxy] SSPI handshake completed");

            // Raw byte streams — never use Console.In/Out, which apply text
            // encoding and newline translation that would corrupt the XML stream.
            using var stdin = Console.OpenStandardInput();
            using var stdout = Console.OpenStandardOutput();

            var toOpenMsx = Pipe(stdin, openMsxStream);
            var fromOpenMsx = Pipe(openMsxStream, stdout);

            // Exit as soon as either direction reaches EOF (mcp-openmsx closed
            // stdin, or openMSX closed the socket).
            await Task.WhenAny(toOpenMsx, fromOpenMsx).ConfigureAwait(false);
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("[mcp-openmsx-sspi-proxy] " + ex);
            return 1;
        }
    }

    /// <summary>
    /// SSPI Negotiate handshake against the openMSX TCP control socket using the
    /// built-in <see cref="NegotiateAuthentication"/> (.NET 7+). Mirrors the loop of
    /// the reference C# proxy: produce a blob, send it length-prefixed, read the
    /// server's reply, repeat until <c>Completed</c>. No external dependency.
    /// </summary>
    private static void DoSspiHandshake(NetworkStream stream)
    {
        using var nego = new NegotiateAuthentication(new NegotiateAuthenticationClientOptions
        {
            Package = "Negotiate",
            // openMSX uses an empty SPN → Negotiate falls back to NTLM on loopback.
            TargetName = string.Empty,
            // openMSX does not seal the XML stream after auth, so request no protection.
            RequiredProtectionLevel = ProtectionLevel.None,
        });

        byte[] incoming = Array.Empty<byte>();
        while (true)
        {
            byte[]? outBlob = nego.GetOutgoingBlob(incoming, out NegotiateAuthenticationStatusCode status);

            if (outBlob is { Length: > 0 })
            {
                SendLengthPrefixed(stream, outBlob);
            }

            if (status == NegotiateAuthenticationStatusCode.Completed)
            {
                break;
            }
            if (status != NegotiateAuthenticationStatusCode.ContinueNeeded)
            {
                throw new InvalidOperationException($"SSPI handshake failed: {status}");
            }

            incoming = ReadLengthPrefixed(stream);
        }
    }

    /// <summary>Copy bytes from <paramref name="input"/> to <paramref name="output"/> until EOF.</summary>
    private static async Task Pipe(Stream input, Stream output)
    {
        var buffer = new byte[8192];
        try
        {
            int read;
            while ((read = await input.ReadAsync(buffer).ConfigureAwait(false)) > 0)
            {
                await output.WriteAsync(buffer.AsMemory(0, read)).ConfigureAwait(false);
                await output.FlushAsync().ConfigureAwait(false);
            }
        }
        catch
        {
            // Either side closed — let Task.WhenAny unblock so the proxy exits.
        }
    }

    /// <summary>Write a big-endian 4-byte length prefix followed by the payload.</summary>
    private static void SendLengthPrefixed(NetworkStream stream, byte[] data)
    {
        Span<byte> len = stackalloc byte[4];
        len[0] = (byte)((data.Length >> 24) & 0xFF);
        len[1] = (byte)((data.Length >> 16) & 0xFF);
        len[2] = (byte)((data.Length >> 8) & 0xFF);
        len[3] = (byte)(data.Length & 0xFF);
        stream.Write(len);
        stream.Write(data, 0, data.Length);
        stream.Flush();
    }

    /// <summary>Read a big-endian 4-byte length prefix and then exactly that many bytes.</summary>
    private static byte[] ReadLengthPrefixed(NetworkStream stream)
    {
        byte[] lenBuffer = ReadExact(stream, 4);
        int length = (lenBuffer[0] << 24) | (lenBuffer[1] << 16) | (lenBuffer[2] << 8) | lenBuffer[3];
        if (length < 0)
        {
            throw new InvalidDataException($"Invalid length prefix: {length}");
        }
        return length == 0 ? Array.Empty<byte>() : ReadExact(stream, length);
    }

    /// <summary>
    /// Read exactly <paramref name="length"/> bytes. TCP does not guarantee a single
    /// Read returns the whole prefix/payload, so loop until satisfied. (The reference
    /// C# proxy had a bug here: a single Read of 4 bytes for the length prefix.)
    /// </summary>
    private static byte[] ReadExact(Stream stream, int length)
    {
        var buffer = new byte[length];
        var totalRead = 0;
        while (totalRead < length)
        {
            var read = stream.Read(buffer, totalRead, length - totalRead);
            if (read == 0)
            {
                throw new EndOfStreamException($"Unexpected EOF while reading {length} bytes");
            }
            totalRead += read;
        }
        return buffer;
    }
}
