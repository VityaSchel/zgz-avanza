# Zaragoza Avanza Bus Transit Pass pwn

> [!IMPORTANT]
> ⚠️ **Aviso legal:** Este repositorio es un proyecto de investigación de seguridad independiente.  \
> No está destinado a cometer fraude ni a facilitar el uso indebido del transporte público. \
> No se proporcionará asistencia para ningún uso ilícito. \
> Consulta [LEGAL.md](./LEGAL.md) para el descargo de responsabilidad completo.

Below are some of my notes on the Zaragoza bus transit pass, which is a MIFARE Classic 1K card. The card has 16 sectors, each with 4 blocks of 16 bytes each. Each sector has two keys (Key A and Key B) that control access to the blocks within that sector.

Presented to you by [zaragoza ⚡️ nerds](https://discord.gg/NRdBaqv3hB) 🤓

Click here to open the reverse engineering spreadsheet with all the collected data and highlights:

<a href="https://docs.google.com/spreadsheets/d/1g89saB1URWRZLWsEJm44vJFTosIDfPkh5u8pfxPWGD0/edit">
	<img alt="Spreadsheet" src="https://git.hloth.dev/hloth/zgz-avanza/raw/branch/main/docs/spreadsheet.avif" width="600" />
</a>

See also:
- [ZGZ Avanza Card Android App](https://git.hloth.dev/hloth/zgz-avanza-card-android)

## Keys

| Sectors | Key A          | Key B          |
| ------- | -------------- | -------------- |
| 0-8     | `04000C0F0903` | `0B02070A0409` |
| 9-15    | `A0A1A2A3A4A5` | `B0B1B2B3B4B5` |
|         |                |                |

## Sectors

| Sector | Description                      |
| ------ | -------------------------------- |
| 0      | Manufacturer block, IDs          |
| 1      | Appears to be latest transaction |
| 2      | Balance (blocks 8 and 9)         |
| 3      | Empty on top up cards            |
| 4      | Empty on top up cards            |
| 5      | Empty                            |
| 6      | Empty                            |
| 7      | Appears to be transaction logs   |
| 8      | Appears to be transaction logs   |
| 9      | Unused                           |
| 10     | Unused                           |
| 11     | Unused                           |
| 12     | Unused                           |
| 13     | Unused                           |
| 14     | Unused                           |
| 15     | Unused                           |
|        |                                  |

## Blocks

| Sector  | Block                                          | Description                                                                                                                                                                                                                                                                                                                                          | Template                           | Access Conditions    |
| ------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| 0       | 0                                              | [00-03] RFID's UID<br>[04] BCC (checksum byte)<br>[05] SAK (always `88` for MIFARE Classic 1K)<br>[15] last two digits of year the card was manufactured in (i.e. `20` for 2020, `25` for 2025)                                                                                                                                                      | `..,,..,,..880400C8,,0020000000..` | Read-only            |
|         | 1                                              | [00-14] Card type (`02699F` for balance cards, `0A9775` for personal expiring cards)<br>[15] XOR of all previous bytes                                                                                                                                                                                                                               | `..,,..000000000000000000000000,,` | Only Key B can write |
|         | 2                                              | [00-01] ASCII prefix (`4245` for `BE`, `4250` for `BP`)<br>[02-04] Zaragoza card ID number (together forming prefix + number)<br>[05-14] empty, zeroed<br>[15] XOR of all previous bytes                                                                                                                                                             | `42,,..,,..00000000000000000000..` | Read-only            |
|         | 3                                              | [0th sector's trailer block](https://github.com/andrea-peter/nfc_mifare_classic_notes/blob/main/mifare-classic.md#sector-trailer-block)                                                                                                                                                                                                              | `04000C0F0903..,,..,,0B02070A0409` | *Trailer*            |
| 1       | 4                                              | Empty on top-up cards<br>[00-14] unknown<br>[15] XOR of all previous bytes                                                                                                                                                                                                                                                                           | `00000000000000000000000000000000` | Only Key B can write |
|         | 5                                              | Empty if new card<br>[00-02] always `020002` for top up cards and `0A0100` or `0A0200` for personal cards<br>[03-04] unknown card-specific constant<br>[05-06] unknown<br>[07] integer<br>[08] either 01 or 02<br>[09-11] unknown<br>[12] BCD-encoded hour (0-23)<br>[13] BCD-encoded minute<br>[14] BCD-encoded second<br>[15] sequence counter     | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 6                                              | *Appears* to always be empty                                                                                                                                                                                                                                                                                                                         | `00000000000000000000000000000000` | No restrictions      |
|         | 7                                              | 1st sector's trailer block                                                                                                                                                                                                                                                                                                                           | `04000C0F0903..,,..,,0B02070A0409` | *Trailer*            |
| 2       | 8                                              | See [balance](#balance)<br>[12-15] static address, always `02FD02FD`                                                                                                                                                                                                                                                                                 | `..,,0000..,,FFFF..,,000002FD02FD` | Value block[^1]      |
|         | 9                                              | Always has the same value as block 8                                                                                                                                                                                                                                                                                                                 | `..,,0000..,,FFFF..,,000002FD02FD` | Value block[^1]      |
|         | 10                                             | Empty if new card, correlates to block 5 (see [Blocks 5 and 10](#blocks-5-and-10))<br>[00-01] unknown<br>[02-05] same as [10-13] in block 5<br>[06-08] always `010200`<br>[09-10] same as [07-08] in block 5<br>[11-14] always `00006300`<br>[15] XOR of all previous bytes<br>Always `000000000000000A000000000000000A` on unlimited personal cards | `..,,..,,..,,010200..,,00006300..` | No restrictions      |
|         | 11                                             | 2nd sector's trailer block                                                                                                                                                                                                                                                                                                                           | `04000C0F0903..,,..,,0B02070A0409` | *Trailer*            |
| 3,4,5,6 | 12, 13, 14, 16, 17, 18, 20, 21, 22, 24, 25, 26 | Empty                                                                                                                                                                                                                                                                                                                                                | `00000000000000000000000000000000` | Only Key B can write |
|         | 15, 19, 23, 27                                 | 3rd, 4th, 5th, 6th sector's trailer blocks                                                                                                                                                                                                                                                                                                           | `04000C0F0903..,,..,,0B02070A0409` | *Trailer*            |
| 7       | 28                                             | Value of block 5 right before overwriting it; each subsequent write adds an entry to blocks 29, then 30, then 32, then 33                                                                                                                                                                                                                            | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 29                                             | Read description of block 28                                                                                                                                                                                                                                                                                                                         | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 30                                             | Read description of block 28                                                                                                                                                                                                                                                                                                                         | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 31                                             | 7th sector's trailer block                                                                                                                                                                                                                                                                                                                           | `04000C0F0903..,,..,,0B02070A0409` | *Trailer*            |
| 8       | 32                                             | Read description of block 28                                                                                                                                                                                                                                                                                                                         | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 33                                             | Read description of block 28                                                                                                                                                                                                                                                                                                                         | `020002..,,..,,..,,..,,..,,..,,..` | No restrictions      |
|         | 34                                             | Always `00000000FFFFFFFF0000000000FF00FF` on top up cards                                                                                                                                                                                                                                                                                            | `00000000FFFFFFFF0000000000FF00FF` | Value block[^1]      |
|         | 35                                             | 8th sector's trailer block                                                                                                                                                                                                                                                                                                                           | `04000C0F0903..,,..,,0B02070A0409` | *Trailer*            |
|         |                                                |                                                                                                                                                                                                                                                                                                                                                      |                                    |                      |

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

Balance on personal unlimited cards is always `00000000FFFFFFFF0000000002FD02FD` (zero).

See [src/balance.ts](src/balance.ts) for encoder/decoder implementation in JavaScript/TypeScript.

## Transaction logs

Transaction logs are stored in sectors 1 (block 5), 7 (blocks 28-30) and 8 (blocks 32-33). Each log entry is 16 bytes, so each block can store one log entry.

- Bytes 00-02: Always `020002`
- Byte 03-04: Appears to be the card's type
- Bytes 05-06: Unknown variable 1
- Byte 07: Line number
- Bytes 08: Line direction (either `01` or `02`)
- Bytes 09: Unknown variable 2
- Byte 10: Likely related to year/season[^2]
- Byte 11: Almost looks like date but does not correlate to sequence counter
- Byte 12: Hour (0-23)
- Byte 13: Minute (0-59)
- Byte 14: Second (0-59)
- Byte 15: Transaction zero-based sequence counter

See [src/transaction.ts](src/transaction.ts) for decoder implementation in JavaScript/TypeScript.

[^2]: July 2021 is `42` and February 2026 is `52`. Perhaps, the year is divided in half to avoid overflowing the BCD-encoded day byte?

## Blocks 5 and 10

Block 10 stores complimentary data to block 5, but unknown how it correlates.

```text
	00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15

             cType ?? ?? linDr ?? yr d? HH MM SS sq
5:  02 00 02 F8 01 06 40 D2 02 25 2A DC 09 1B 2F 01
10: 00 00 2A DC 09 1B 01 02 00 D2 02 00 00 63 00 54
    ?? ?? yr d? HH MM          linDr

             cType ?? ?? linDr ?? yr d? HH MM SS sq
5:  02 00 02 F8 01 03 20 D2 01 FE 2A D8 13 2D 12 01
10: 00 00 2A D8 13 2D 01 02 00 D2 01 00 00 63 00 7F
    ?? ?? yr d? HH MM          linDr
 
             cType ?? ?? linDr ?? yr d? HH MM SS sq
5:  02 00 02 F8 01 05 DC D2 02 6B 2A D9 0D 33 3B 02
10: D2 01 2A D9 0D 33 01 02 00 D2 02 00 00 63 00 AE
    ?? ?? yr d? HH MM          linDr

             cType ?? ?? linDr ?? yr d? HH MM SS sq
5:  02 00 02 F8 01 02 BC D2 01 99 2A D9 10 26 0D 03
10: D2 02 2A D9 10 26 01 02 00 D2 01 00 00 63 00 A6
    ?? ?? yr d? HH MM          linDr

             cType ?? ?? linDr ?? yr d? HH MM SS sq
5:  02 00 02 26 01 80 CE 16 01 0D 34 54 10 2D 24 03
10: 23 02 34 54 10 2D 01 02 00 16 01 00 00 63 00 0B
    ?? ?? yr d? HH MM          linDr

cType = some constant, could be related to season or card type
linDr = line number and direction (either `01` or `02`)
yr = related to year, see ^2 in footnotes
d? = probably date in some form
HH, MM, SS = hour, minute, second
sq = sequence counter
```

## Acknowledgements

Huge thanks to [li0ard](https://li0ard.rest/) for help with decoding RFIDs!

## License

[MIT](./LICENSE)

## Donate

[hloth.dev/donate](https://hloth.dev/donate)
