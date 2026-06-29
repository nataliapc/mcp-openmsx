# How to detect the RAM

This page was last modified 14:10, 3 October 2020 by Gdx.

Source: https://www.msx.org/wiki/How_to_detect_the_RAM

---

When a disk system is present, main RAM slot ID can be read from following addresses:

* F341h = Slot ID of Main-RAM on page 0000h~3FFFh
* F342h = Slot ID of Main-RAM on page 4000h~7FFFh
* F343h = Slot ID of Main-RAM on page 8000h~BFFFh
* F344h = Slot ID of Main-RAM on page C000h~FFFFh
