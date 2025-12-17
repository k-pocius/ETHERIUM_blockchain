#kontraktas_blockchain

MODELIS: Kursų platforma su papildomu instruktoriaus samdymu

Veikėjai:
Studentas — perka kursus ir gali papildomai nusisamdyti instruktorių. <br>
Instruktorius — teikia papildomą pagalbą studentui už mokestį. <br>
Kursų platforma — kursų pardavėjas / tarpininkas (gauna mokėjimą už kursą, nurodo instruktorius, patvirtina kursų užbaigimą).<br>

Pagrindiniai procesai:<br>
Studentas perka kursą, sumoka už kursus per smart contract (escrow).<br>
Platforma gauna pinigus, kai studentas patvirtina, kad gavo prieigą.<br>
Studentas gali pasirinktinai samdyti instruktorių.<br>
Studentas perveda papildomą mokestį į kontraktą.<br>
Instruktorius gauna išmoką, kai platforma patvirtina, kad konsultacija įvyko.<br>
Platforma patvirtina kursų suteikimą / instruktoriaus edukacinę paslaugą<br>
Patvirtinimas aktyvuoja mokėjimą Instruktoriui arba Platformai.<br>
Refund galimybė<br>
Jei Studentas negauna prieigos per X laiką → jam grąžinami pinigai.<br>
Jei Instruktorius neatlieka darbo → studentas gauna grąžinimą.<br>


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


![Alt text](diagram.png)


### Course State
| State pavadinimas      | Reikšmė                                               
| ---                    | ---                                                   
| CourseCreated          | Studentas pasirinko kursą            
| CoursePaid             | Studentas sumokėjo mokestį už kursą                            
| CourseAccessGranted    | Platforma suteikė prieigą   
| CourseWaitingStudentConfirmation | platforma laukia studento patvirtinimo
| CourseCompleted        | Studentas patvirtino, kad gavo prieigą / kursai užbaigti 
| CourseRefundRequested  | Studentas pasirenka atsisakyti kursų
| CourseRefunded         | Grąžinimas studentui                                  
                                 

### Instructor State
| State pavadinimas      | Reikšmė                                               
| ---                    | ---                                                   
| InstructorNotHired     | Studentas nenusisamdė instruktoriaus                 
| InstructorHired        | Studentas sumokėjo instruktoriaus mokestį              
| HelpProvided           | Instruktorius pažymėjo, kad paslauga suteikta         
| InstructorServiceConfirmed    | Platforma patvirtino intruktoriaus paslaugą  
| InstructorRefundRequested | Studentas pasirenka atsisakyti instruktoriaus paslaugų
| InstructorRefunded     | Studentui grąžinta suma                               
| InstructorPaid         | Instruktorius gavo apmokėjimą  




### Course — Student Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| payCourseFee()           | Studentas apmoka kursą (ETH siunčiama į escrow)       | Student         |
| acceptCourse()  | Studentas patvirtina, kad gavo prieigą                | Student         |
| requestRefundCourse()    | Studentas prašo grąžinimo, jei platforma nesuteikė paslaugos | Student |

### Course — Platform Actions
| Function                  | Kas daro                                               | Kas gali vykdyti |
| ---                      | ---                                                   | ---             |
| confirmCourseAccess()    | Platforma patvirtina, kad prieiga suteikta            | Platform        |
| approveRefundCourse()    | Platforma patvirtina grąžinimą                        | Platform        |

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



4. Užduotis: Realizuokite pirmąjame žingsnyje aprašytą verslo logiką išmanioje sutartyje Solidyti kalboje. <br>

Contracts folderyje susikūriau naują sol failą ir ten įsikėliau savo išmanų kontraktą. <br>
Sukompiliavau, sudėjau platformos, intruktoriaus adresus ir gwei sumas už paslaugas. <br>
Deployinau<br>

![Alt text](remix1.png)

![Alt text](remix2.png)
















