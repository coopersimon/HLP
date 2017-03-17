MOV  R0, #5
                                           MOV  R1, #3
                                           MOV  R2, R0
                                           LOOP
                                           ADD  R3, R3, R1
                                           SUBS R2, R2, #1
                                           BNE  LOOP
          MOV R1, #0
          ADDMI R1, R1, #8
          ADDEQ R1, R1, #4
          ADDCS R1, R1, #2
          ADDVS R1, R1, #1
       