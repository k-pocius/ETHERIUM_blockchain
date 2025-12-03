# ETHERIUM_blockchain

MODELIS: Kursų platforma su papildomu instruktoriaus samdymu

Veikėjai:
Studentas — perka kursus ir gali papildomai nusisamdyti instruktorių.
Instruktorius — teikia papildomą pagalbą studentui už mokestį.
Kursų platforma — kursų pardavėjas / tarpininkas (gauna mokėjimą už kursą, nurodo instruktorius, patvirtina kursų užbaigimą).

Pagrindiniai procesai:
Studentas perka kursą, sumoka už kursus per smart contract (escrow).
Platforma gauna pinigus, kai studentas patvirtina, kad gavo prieigą.
Studentas gali pasirinktinai samdyti instruktorių.
Studentas perveda papildomą mokestį į kontraktą.
Instruktorius gauna išmoką, kai platforma patvirtina, kad konsultacija įvyko.
Platforma patvirtina kursų suteikimą / instruktoriaus edukacinę paslaugą
Patvirtinimas aktyvuoja mokėjimą Instruktoriui arba Platformai.
Refund galimybė
Jei Studentas negauna prieigos per X laiką → jam grąžinami pinigai.
Jei Instruktorius neatlieka darbo → studentas gauna grąžinimą.


procesų scenarijai:

Scenarijus A: Kursų pirkimas<br>
Studentas pasirenka kursą.<br>
Studentas sumoka kontraktui (escrow).<br>
Platforma suteikia prieigą prie kurso (įkelia hash/URL).<br>
Studentas patvirtina, kad prieiga gauta.<br>
Kontraktas perveda sumą Platformai.<br>

Scenarijus B: Instruktoriaus samdymas<br>
Studentas pasirenka instruktorių.<br>
Studentas sumoka už konsultacijas į kontraktą.<br>
Instruktorius atlieka paslaugą.<br>
Platforma patvirtina paslaugos atlikimą.<br>
Kontraktas išmoka instruktoriui.<br>

Scenarijus C: Refund (grąžinimai)<br>
Jei platforma nesuteikia prieigos per X laiką → Student gauna refund.<br>
Jei instruktorius neatlieka darbo per X laiką → Student gauna refund. <br>
Platforma gali nuskaityti dalį mokesčio (jei norima). <br>


### Course State
| State pavadinimas       | Reikšmė                                               | Kada naudojama                          |
| ---                    | ---                                                   | ---                                     |
| CourseCreated          | Studentas pasirinko kursą, dar nesumokėjo             | startas                                 |
| CoursePaid             | Studentas sumokėjo mokestį                             | lėšos escrow'e                          |
| CourseAccessGranted    | Platforma suteikė prieigą                              | studentas gali mokytis                  |
| CourseCompleted        | Studentas patvirtino, kad gavo prieigą / kursai užbaigti | kursai užbaigti                         |
| CourseRefunded         | Grąžinimas studentui                                   | jei platforma nesuteikė prieigos        |
| CourseClosed           | Kontrakto pabaiga                                      | mokėjimas atliktas arba grąžinta        |

### Instructor State
| State pavadinimas       | Reikšmė                                               | Kada naudojama                          |
| ---                    | ---                                                   | ---                                     |
| InstructorNotHired     | Studentas nenusisamdė instruktoriaus                  | pradinė                                 |
| InstructorHired        | Studentas sumokėjo instruktoriaus mokestį              | lėšos escrow'e                          |
| HelpProvided           | Instruktorius pažymėjo, kad paslauga suteikta         | instruktorius pabaigė darbą             |
| InstructorConfirmed    | Platforma patvirtino paslaugą                          | pasiruošta išmokėti                     |
| InstructorRefunded     | Studentui grąžinta suma                                | pagal refund procesą                    |
| InstructorPaid         | Instruktorius gavo apmokėjimą                          | uždaroma seka                           |

### Course — Student Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| payCourseFee()           | Studentas apmoka kursą (ETH siunčiama į escrow)       | Student         |
| confirmCourseReceived()  | Studentas patvirtina, kad gavo prieigą                | Student         |
| requestRefundCourse()    | Studentas prašo grąžinimo, jei platforma nesuteikė paslaugos | Student |

### Course — Platform Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| confirmCourseAccess()    | Platforma patvirtina, kad prieiga suteikta            | Platform        |
| approveRefundCourse()    | Platforma patvirtina grąžinimą                        | Platform        |
| withdrawCoursePayment()  | Platforma pasiima mokėjimą po patvirtinimo            | Platform        |

### Instructor-related — Student Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| payInstructorFee()       | Studentas sumoka instruktoriaus mokestį               | Student         |
| requestRefundInstructor()| Studentas prašo grąžinti, jei paslauga nesuteikta     | Student         |

### Instructor-related — Instructor Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| markHelpProvided()       | Instruktorius pažymi, kad konsultacija įvyko          | Instructor      |

### Instructor-related — Platform Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| confirmInstructorService() | Platforma tvirtina instruktoriaus paslaugą           | Platform        |
| approveRefundInstructor()  | Platforma patvirtina instruktoriaus grąžinimą        | Platform        |
| withdrawInstructorPayment() | Instruktorius pasiima mokėjimą                       | Instructor      |



