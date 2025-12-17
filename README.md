#kontraktas_blockchain

MODELIS: Kursų platforma su papildomu instruktoriaus samdymu

Veikėjai:
Studentas — perka kursus ir gali papildomai nusisamdyti instruktorių. <br>
Instruktorius — teikia papildomą pagalbą studentui už mokestį. <br>
Kursų platforma — kursų pardavėjas / tarpininkas (gauna mokėjimą už kursą, nurodo instruktorius, patvirtina kursų užbaigimą).<br>

Pagrindiniai procesai:<br>
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

Scenarijus A:

Kursų pirkimas<br>
Studentas pasirenka kursą.<br>
Studentas sumoka kontraktui (escrow).<br>
Platforma suteikia prieigą prie kurso (įkelia hash/URL).<br>
Studentas patvirtina, kad prieiga gauta.<br>
Kontraktas perveda sumą Platformai.<br>

Scenarijus B: 

Instruktoriaus samdymas<br>
Studentas pasirenka instruktorių.<br>
Studentas sumoka už konsultacijas į kontraktą.<br>
Instruktorius atlieka paslaugą.<br>
Platforma patvirtina paslaugos atlikimą.<br>
Kontraktas išmoka instruktoriui.<br>

Scenarijus C: Refund (grąžinimai)<br>
Jei platforma nesuteikia prieigos per X laiką → Student gauna refund.<br>
Jei instruktorius neatlieka darbo per X laiką → Student gauna refund. <br>
Platforma gali nuskaityti dalį mokesčio (jei norima). <br>

![Alt text](diagram.png)


### Course State
| State pavadinimas      | Reikšmė                                               
| ---                    | ---                                                   
| CourseCreated          | Studentas pasirinko kursą            
| CoursePaid             | Studentas sumokėjo mokestį už kursą                            
| CourseAccessGranted    | Platforma suteikė prieigą                             
| CourseCompleted        | Studentas patvirtino, kad gavo prieigą / kursai užbaigti 
| CourseRefunded         | Grąžinimas studentui                                  
| CourseClosed           | Kurso galiojimo laiko pabaiga                                    

### Instructor State
| State pavadinimas      | Reikšmė                                               
| ---                    | ---                                                   
| InstructorNotHired     | Studentas nenusisamdė instruktoriaus                 
| InstructorHired        | Studentas sumokėjo instruktoriaus mokestį              
| HelpProvided           | Instruktorius pažymėjo, kad paslauga suteikta         
| InstructorConfirmed    | Platforma patvirtino intruktoriaus paslaugą                         
| InstructorRefunded     | Studentui grąžinta suma                               
| InstructorPaid         | Instruktorius gavo apmokėjimą  




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




