# Zaragoza Bus Transit Pass pwn

Below are some of my notes on the Zaragoza bus transit pass, which is a MIFARE Classic 1K card. The card has 16 sectors, each with 4 blocks of 16 bytes each. Each sector has two keys (Key A and Key B) that control access to the blocks within that sector.

Presented to you by [zaragoza ⚡️ nerds](https://discord.gg/NRdBaqv3hB) 🤓

Click here to open the reverse engineering spreadsheet with all the collected data and highlights:

<a href="https://docs.google.com/spreadsheets/d/1g89saB1URWRZLWsEJm44vJFTosIDfPkh5u8pfxPWGD0/edit">
	<img alt="Spreadsheet" src="https://git.hloth.dev/hloth/zgz-avanza/raw/branch/main/docs/spreadsheet.avif" width="600" />
</a>

## Keys

| Sectors | Key A          | Key B          |
| ------- | -------------- | -------------- |
| 0-8     | `04000C0F0903` | `0B02070A0409` |
| 9-15    | `A0A1A2A3A4A5` | `B0B1B2B3B4B5` |
|         |                |                |

## Sectors

| Sector | Description                                       |
| ------ | ------------------------------------------------- |
| 0      | Manufacturer block, IDs                           |
| 1      | Unknown; Appears to be empty (nulls) on new cards |
| 2      | Balance (blocks 8 and 9)                          |
| 3      | Empty                                             |
| 4      | Empty                                             |
| 5      | Empty                                             |
| 6      | Empty                                             |
| 7      | Appears to be transaction logs                    |
| 8      | Appears to be transaction logs                    |
| 9      | Unused                                            |
| 10     | Unused                                            |
| 11     | Unused                                            |
| 12     | Unused                                            |
| 13     | Unused                                            |
| 14     | Unused                                            |
| 15     | Unused                                            |
|        |                                                   |

## Blocks

| Sector  | Block                                          | Description                                                                                                                                                                                                                                                                   | Template                           | Access Conditions    |
| ------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| 0       | 0                                              | Bytes 00-03 are RFID's UID, byte 04 is BCC (checksum byte), byte 05 is SAK (always `88` for MIFARE Classic 1K), byte 15 is last two digits of year the card was manufactured in (i.e. `20` for 2020, `25` for 2025)                                                           | `..,,..,,..880400C8,,0020000000..` | Read-only            |
|         | 1                                              | Always `02699F000000000000000000000000F4`                                                                                                                                                                                                                                     | `02699F000000000000000000000000F4` | Only Key B can write |
|         | 2                                              | Bytes 00-01 are always `4245` (`BE` in ASCII); Bytes 02-04 are Zaragoza card ID number (together forming `BE` + number); Bytes 05-14 are zeroed (likely for bigger integers); Byte 15 has unknown use but never changes                                                       | `4245..,,..00000000000000000000..` | Read-only            |
|         | 3                                              | [0th sector's trailer block](https://github.com/andrea-peter/nfc_mifare_classic_notes/blob/main/mifare-classic.md#sector-trailer-block), always `04000C0F09032C378D000B02070A0409` (first 6 bytes is Key A, then 4 bytes are AC, then Key B)                                  | `04000C0F09032C378D000B02070A0409` | *Trailer*            |
| 1       | 4                                              | *Appears* to always be empty                                                                                                                                                                                                                                                  | `00000000000000000000000000000000` | Only Key B can write |
|         | 5                                              | Empty if new card; otherwise bytes 00-03 are always `020002`, bytes 03-04 are unknown and constant per card, bytes 05-06 unknown, byte 07 is integer, bytes 08-11 unknown, bytes 12-14 are BCD-encoded HH:MM:SS timestamp, byte 15 is transaction zero-based sequence counter | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 6                                              | *Appears* to always be empty                                                                                                                                                                                                                                                  | `00000000000000000000000000000000` | No restrictions      |
|         | 7                                              | 1st sector's trailer block, always `04000C0F09037E1788000B02070A0409`                                                                                                                                                                                                         | `04000C0F09037E1788000B02070A0409` | *Trailer*            |
| 2       | 8                                              | Balance, see below; bytes 12-15 are static address, always `02FD02FD`                                                                                                                                                                                                         | `..,,0000..,,FFFF..,,000002FD02FD` | Value block[^1]      |
|         | 9                                              | Always has the same value as block 8                                                                                                                                                                                                                                          | `..,,0000..,,FFFF..,,000002FD02FD` | Value block[^1]      |
|         | 10                                             | Empty if new card; otherwise bytes 00-05 unknown, bytes 06-08 are always `010200`, bytes 11-14 are always `00006300`                                                                                                                                                          | `..,,..,,..,,010200..,,..02FD02FD` | No restrictions      |
|         | 11                                             | 2nd sector's trailer block, always `04000C0F09034C378B000B02070A0409`                                                                                                                                                                                                         | `04000C0F09034C378B000B02070A0409` | *Trailer*            |
| 3,4,5,6 | 12, 13, 14, 16, 17, 18, 20, 21, 22, 24, 25, 26 | Empty                                                                                                                                                                                                                                                                         | `00000000000000000000000000000000` | Only Key B can write |
|         | 15, 19, 23, 27                                 | 3rd, 4th, 5th, 6th sector's trailer blocks, always `04000C0F0903787788000B02070A0409`                                                                                                                                                                                         | `04000C0F0903787788000B02070A0409` | *Trailer*            |
| 7       | 28                                             | Appears to be the previous value of block 5 right before overwriting it, each subsequent write adds an entry to blocks 29, then 30, then 32, then 33                                                                                                                          | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 29                                             | Read description of block 28                                                                                                                                                                                                                                                  | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 30                                             | Read description of block 28                                                                                                                                                                                                                                                  | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 31                                             | 7th sector's trailer block, always `04000C0F09037F0788000B02070A0409`                                                                                                                                                                                                         | `04000C0F09037F0788000B02070A0409` | *Trailer*            |
| 8       | 32                                             | Read description of block 28                                                                                                                                                                                                                                                  | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 33                                             | Read description of block 28                                                                                                                                                                                                                                                  | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 34                                             | *Appears* to always be `00000000FFFFFFFF0000000000FF00FF`                                                                                                                                                                                                                     | `00000000FFFFFFFF0000000000FF00FF` | Value block[^1]      |
|         | 35                                             | 8th sector's trailer block, always `04000C0F09033B478C000B02070A0409`                                                                                                                                                                                                         | `04000C0F09033B478C000B02070A0409` | *Trailer*            |
|         |                                                |                                                                                                                                                                                                                                                                               |                                    |                      |

[^1]: Value blocks have the following restrictions: Key A can read, decrement, restore and transfer, Key B can also write and increment.

Value blocks 8, 9 and 34 store a 32-bit integer three times for redundancy: the value, its bitwise complement, then the value again.

The balance is stored in blocks 8 and 9 for redundancy.

## Balance

€1.00 = 1000 units. For example, a balance of €5.00 would be stored as `8813000077ecffff8813000002fd02fd` in blocks 8 and 9:

1. Convert `5.00` to units: `5000`
2. Convert `5000` to hexadecimal: `1388`
3. Convert to little-endian: `8813`
4. Calculate the complement: `77ec` (flip every bit)
5. Write the value, complement, and value again, then append the static address `02fd02fd` and write to blocks 8 and 9

- Bytes 00-03: `88130000` -> little-endian -> `5000`
- Bytes 04-07: `77ecffff` -> complement of `5000`
- Bytes 08-11: `88130000` -> value repeated
- Bytes 12-13: `02fd` -> address bytes (block pointer for transfer operations)
- Bytes 14-15: `02fd` -> address bytes repeated

## Transaction logs

Transaction logs are stored in sectors 1 (block 5), 7 (blocks 28-30) and 8 (blocks 32-33). Each log entry is 16 bytes, so each block can store one log entry.

- Bytes 00-02: Always `020002`
- Byte 03-04: Appears to be a card type
- Bytes 05-06: Unknown variable 1
- Byte 07: Line number
- Bytes 08: Line direction (either `01` or `02`)
- Bytes 09-11: Unknown variable 2 (byte 10 is likely related to year/season[^2], byte 11 almost looks like date but does not correlate to sequence)
- Byte 12: Hour (0-23)
- Byte 13: Minute (0-59)
- Byte 14: Second (0-59)
- Byte 15: Transaction zero-based sequence counter

[^2]: July 2021 is `42` and February 2026 is `52`. Perhaps, the year is divided in half to avoid overflowing the BCD-encoded day byte?

## Acknowledgements

Huge thanks to [li0ard](https://li0ard.rest/) for help with decoding RFIDs!

## License

[MIT](./LICENSE)

## Donate

[hloth.dev/donate](https://hloth.dev/donate)
