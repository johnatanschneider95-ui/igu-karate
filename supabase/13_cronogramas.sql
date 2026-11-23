-- IGU Karatê · cronogramas por faixa extraídos da apostila (Associação Okinawa de Karatê-Dô Goju-Ryu)
-- Cada faixa recebe o conteúdo do exame para passar DELA para a próxima, em 3 blocos: Kihon-Ido, Kata e Kumite.
-- ATENÇÃO: apaga o cronograma atual (e as validações de itens dos alunos) e recria tudo.
delete from belt_curriculum;
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Branca'), 'bases', 'KIHON-IDO 10º KYU (branca para cinza)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI - JYODAN-UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO DACHI SHAKAKU – GEDAN BARAI

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN-DACHI – JYODAN TSUKI
2.ZENKUTSU-DACHI – CHUDAN TSUKI
3.SHIKO-DACHI-SHAKAKU – SEIKEN TSUKI

SANCHIN-KUMITE-NO-KAMAE

1.SANCHIN DACHI - MAE GUERÍ KEAGE
2.ZENKUTSU DACHI – MAE GUERÍ KIKOMI
3.HAN-ZENKUTSU DACHI - MAWASHI GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Branca'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Cinza'), 'bases', 'KIHON-IDO 9º KYU (cinza para azul claro)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO DACHI -SHAKAKU – GEDAN BARAI

HIDARI-SANCHIN-DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO DACHI SHAKAKU – SEIKEN TSUKI

SANCHIN DACHI KUMITE NO KAMAE

1.SANCHIND ACHI MAE-GUERÍ KEAGE
2.ZENKUTSU DACHI – MAE-GUERÍ KIKOMI
3.HAN-ZENKUTSU DACHI - MAWASHI GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Cinza'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Cinza'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Azul clara'), 'bases', 'KIHON-IDO 8º KYU (azul claro para amarela)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI-SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO DACHI SHAKAKU – GEDAN BARAI

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO-DACHI SHAKAKU – SEIKEN TSUKI

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN DACHI - MAE GUERÍ KEAGE
2.ZENKUTSU DACHI – MAE GUERÍ KIKOMI
3.HAN ZENKUTSU - DACHI MAWASHI GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Azul clara'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Azul clara'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite iti
IPPON Kumite ni', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Amarela'), 'bases', 'KIHON-IDO 7º KYU (amarela para laranja)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI – SOTO UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO-DACHI -SHAKAKU – GEDAN BARAI
4. SANCHIN DACHI – YOKO UKE SHITA BARAI

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN-TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO DACHI SHAKAKU – SEIKEN TSUKI
4. ZENKUTSU DACHI – HIJE ATE

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN-DACHI MAE-GUERÍ KEAGE
2.ZENKUTSU-DACHI – MAE-GUERÍ KIKOMI
3.HAN-ZENKUTSU-DACHI MAWASHI GERI
4. HAN-ZENKUTSU-DACHI SOKUTO GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Amarela'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti

KIHON KATA
Kihon Kata Sanchin', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Amarela'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Laranja'), 'bases', 'KIHON-IDO 6º KYU (laranja para vermelha)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO-DACHI -SHAKAKU – GEDAN BARAI
4.SANCHIN DACHI – YOKO UKE SHITA BARAI

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN-TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO DACHI SHAKAKU – SEIKEN TSUKI
4. ZENKUTSU DACHI – HIJE ATE

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN-DACHI MAE-GUERÍ KEAGE
2.ZENKUTSU-DACHI – MAE-GUERÍ KIKOMI
3.HAN-ZENKUTSU-DACHI MAWASHI GERI
4. HAN-ZENKUTSU-DACHI SOKUTO GERI
5.NEKO ASHI DACHI – KANSETSU GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Laranja'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti

KIHON KATA
Kihon Kata Sanchin', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Laranja'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Vermelha'), 'bases', 'KIHON-IDO 5º KYU (vermelha para azul escuro)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1. SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3. SHIKO-DACHI -SHAKAKU – GEDAN BARAI
4. SANCHIN DACHI – YOKO UKE SHITA BARAI
5. NEKO ASHI DACHI – KAKE UKE
6. SANCHIN DACHI – MAWASHI UKE

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO DACHI SHAKAKU – SEIKEN TSUKI
4. ZENKUTSU DACHI – HIJE ATE
5.SHIKO DACHI CHOKAKU – SEIKEN TSUKI

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN DACHI – MAE GUERÍ KEAGE
2.ZENKUTSU DACHI – MAE GUERÍ KIKOMI
3.HAN ZENKUTSU DACHI - MAWASHI GERI
4.HAN ZENKUTSU DACHI - SOKUTO GERI
5.NEKO ASHI DACHI – KANSETSU GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Vermelha'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti
Taikyoku Kake Uke Ni
Taikyoku Mawashi Uke Iti

KIHON KATA
Kihon Kata Sanchin', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'infantil' and name = 'Vermelha'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Branca'), 'bases', 'KIHON-IDO 7º KYU (branca para amarela)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI-SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO DACHI SHAKAKU – GEDAN BARAI

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO-DACHI SHAKAKU – SEIKEN TSUKI

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN DACHI - MAE GUERÍ KEAGE
2.ZENKUTSU DACHI – MAE GUERÍ KIKOMI
3.HAN ZENKUTSU - DACHI MAWASHI GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Branca'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Branca'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite iti
IPPON Kumite ni', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Amarela'), 'bases', 'KIHON-IDO 6º KYU (amarela para laranja)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1.SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3.SHIKO-DACHI -SHAKAKU – GEDAN BARAI
4.SANCHIN DACHI – YOKO UKE SHITA BARAI

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN-TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO DACHI SHAKAKU – SEIKEN TSUKI
4. ZENKUTSU DACHI – HIJE ATE

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN-DACHI MAE-GUERÍ KEAGE
2.ZENKUTSU-DACHI – MAE-GUERÍ KIKOMI
3.HAN-ZENKUTSU-DACHI MAWASHI GERI
4. HAN-ZENKUTSU-DACHI SOKUTO GERI
5.NEKO ASHI DACHI – KANSETSU GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Amarela'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti
Taikyoku Mawashi Uke Iti

KIHON KATA
Kihon Kata Sanchin', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Amarela'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Laranja'), 'bases', 'KIHON-IDO 5º KYU (laranja para azul escuro)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI SANCHIN DACHI – UKE NO KAMAE

1. SANCHIN DACHI – JYODAN UKE
2.ZENKUTSU DACHI – SOTO UKE
3. SHIKO-DACHI -SHAKAKU – GEDAN BARAI
4. SANCHIN DACHI – YOKO UKE SHITA BARAI
5. NEKO ASHI DACHI – KAKE UKE
6. SANCHIN DACHI – MAWASHI UKE

HIDARI SANCHIN DACHI – SEIKEN TSUKI NO KAMAE

1.SANCHIN DACHI – JYODAN TSUKI
2.ZENKUTSU DACHI – CHUDAN TSUKI
3.SHIKO DACHI SHAKAKU – SEIKEN TSUKI
4. ZENKUTSU DACHI – HIJE ATE
5.SHIKO DACHI CHOKAKU – SEIKEN TSUKI

SANCHIN DACHI KUMITE KAMAE

1.SANCHIN DACHI – MAE GUERÍ KEAGE
2.ZENKUTSU DACHI – MAE GUERÍ KIKOMI
3.HAN ZENKUTSU DACHI - MAWASHI GERI
4.HAN ZENKUTSU DACHI - SOKUTO GERI
5.NEKO ASHI DACHI – KANSETSU GERI', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Laranja'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti
Taikyoku Kake Uke Ni
Taikyoku Mawashi Uke Iti
Gekisai Ni

KIHON KATA
Kihon Kata Sanchin', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Laranja'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Azul escura'), 'bases', 'KIHON-IDO 4º KYU (azul escuro para verde)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI – SANCHIN DACHI UKE NO KAMAE

01- SANCHIN DACHI - JYODAN UKE - CHUDAN TSUKI
02- ZENKUTSU DACHI - CHUDAN UKE - JYODAN TSUKI
03 - SHIKODACHI SHAKAKU - GEDAN BARAI - CHUDAN TSUKI
04 - SANCHIN DACHI - YOKO UKE - SHITA BARAI - MOROTE TSUKI

HIDARI - SANCHIN DACHI SEIKEN TSUKI KAMAE

01 - SANCHIN DACHI - CHUDAN TSUKI SONOBA- MAE GERI(CHUDAN)
02 – ZENKUTSU DACHI - MAE GUERI (CHUDAN) – CHUDAN TSUKI
03 - SHIKODACHI SHAKAKU - HIJI ATE - YONHON DOSA
04 - ZENKUTSU DACHI - HIJI ATE - SEIKEN TSUKI(CHUDAN)
05 – SHIKO DACHI CHOKKAKU - TETSUI - URA UCHI

HIDARI- SANCHIN DACHI KUMITE KAMAE

01 - SANCHIN DACHI-KIZAME MAE GERI (CHUDAN)- MAWASHI GERI (JODAN)
02 - ZENKUTSU DACHI - MAE GERI - HIJI ATE YONHON DOSA
03 - HANZENKUTSU - SOKUTO GERI (CHUDAN) - GYAKU TSUKI (CHUDAN)
04 -SHIKO DACHI SHAKAKU- KANSETSU GERI-AGE TSUKI-YONHON DOSA', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Azul escura'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti
Taikyoku Kake Uke Ni
Taikyoku Mawashi Uke Iti
Taikyoku Mawashi Uke Ni
Gekisai Ni
Saifa

KIHON KATA
Kihon Kata Sanchin
Kihon Kata Tensho
Shiho Ido', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Azul escura'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti
BUNKAI KATA gekisai iti', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Verde'), 'bases', 'KIHON-IDO 3º KYU (verde para roxa)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO

HIDARI – SANCHIN DACHI UKE NO KAMAE

01- SANCHIN DACHI - JYODAN UKE - CHUDAN TSUKI
02- ZENKUTSU DACHI - CHUDAN UKE - JYODAN TSUKI
03 - SHIKODACHI SHAKAKU - GEDAN BARAI - CHUDAN TSUKI
04 - SANCHIN DACHI - YOKO UKE - SHITA BARAI - MOROTE TSUKI

HIDARI - SANCHIN DACHI SEIKEN TSUKI KAMAE

01 - SANCHIN DACHI - CHUDAN TSUKI SONOBA- MAE GERI(CHUDAN)
02 – ZENKUTSU DACHI - MAE GUERI (CHUDAN) – CHUDAN TSUKI
03 - SHIKODACHI SHAKAKU - HIJI ATE - YONHON DOSA
04 - ZENKUTSU DACHI - HIJI ATE - SEIKEN TSUKI(CHUDAN)
05 – SHIKO DACHI CHOKKAKU - TETSUI - URA UCHI

HIDARI- SANCHIN DACHI KUMITE KAMAE

01 - SANCHIN DACHI-KIZAME MAE GERI (CHUDAN)- MAWASHI GERI (JODAN)
02 - ZENKUTSU DACHI - MAE GERI - HIJI ATE YONHON DOSA
03 - HANZENKUTSU - SOKUTO GERI (CHUDAN) - GYAKU TSUKI (CHUDAN)
04 -SHIKO DACHI SHAKAKU- KANSETSU GERI-AGE TSUKI-YONHON DOSA', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Verde'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti
Taikyoku Kake Uke Ni
Taikyoku Mawashi Uke Iti
Taikyoku Mawashi Uke Ni
Gekisai Ni
Saifa
Seenchin
Sanseru
Seipai

KIHON KATA
Kihon Kata Sanchin
Kihon Kata Tensho
Shiho Ido', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Verde'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti
IPPON Kumite Ni
YAKUSOKU Kumite iti
BUNKAI KATA gekisai iti
BUNKAI KATA gekisai ni
Bunkai Kata Saifa
Nanahon Kumite', 2);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Roxa'), 'bases', 'KIHON-HOYDO 2º KYU (roxa para marrom)', 'TODOS OS MOVIMENTOS SÃO REPETIDOS 3X AVANÇANDO E 3X RECUANDO
Indicado para alunos com mais de 15 anos.

SANCHIN DACHI KUMITE NO KAMAE

1. SANCHIN DACHI - SANBON TSUKI (Jyodan - chudan – chudan)
2. SANCHIN DACHI - JYODAN UKE - CHUDAN TSUKI (SONOBA) MAE GERI
(inicia com a esquerda).
3. SURI ASHI DACHI - HIJI UKE (SOTO) JYODAN HIJI TSUKI (GIAKU)
4. SURI ASHI DACHI – URA UCHI (para baixo) CHUDAN HIJI TSUKI (GIAKU) DEPOIS TROCA A PERNA
(obs: 1° passo perna da frente, abafa de cima p/ baixo, uraken de frente + gyaku).
5. SURI ASHI DACHI - MAE GERI - REN TSUKI (OISUKI E GIAKU)
(obs: 1°mae geri com a perna de trás, depois suri ashi sem mudar a perna).

MOTO DACHI KUMITE KAMAE

1. MOTO DACHI TSUGI ASHI (sem passo) – REN TSUKI (sonoba) MAE GERI
(obs: oizuki + giaku – troca perna/muda a base).
2. HIKI AYUMI ASHI – REN TSUKI (oi tsuki + giaku)
(obs: puxa levemente a perna da frente e avança a perna de trás).
3. TSUGI ASHI – MAE GERI (kizami sem passo) – REN TSUKI (Oi tsuki e Gyaku) troca a perna.
4. HIKI AYUMI ASHI – CHOKAKU SEIKEN TSUKI – SOKUTO GERI
(obs: volta moto dachi apósos golpes).
5. SURI ASHI – URA UCHI JODAN – SEIKEN TSUKI – MAE GERI.
(obs: avança perna da frente, ura lateral).
6. MAWASHI GERI – MAE GERI – OIASHI REN TSUKI (oi tsuki + gyaku).', 0);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Roxa'), 'kata', 'Kata', 'FUKYU KATA
Taikyoku Jyodan Iti
Taikyoku Chudan Iti
Taikyoku Gedan Iti
Taikyoku Jyodan Ni
Taikyoku Chudan Ni
Taikyoku Gedan Ni
Gekisai Iti
Taikyoku Kake Uke Iti
Taikyoku Kake Uke Ni
Taikyoku Mawashi Uke Iti
Taikyoku Mawashi Uke Ni
Gekisai Ni
Saifa
Seenchin
Sanseru
Seipai
Suparimpei

KIHON KATA
Kihon Kata Sanchin
Kihon Kata Tensho
Shiho Ido', 1);
insert into belt_curriculum (belt_id, category, title, description, position) values ((select id from belts where track = 'regular' and name = 'Roxa'), 'kumite', 'Kumite', 'KUMITE
IPPON Kumite Iti e Ni
YAKUSOKU Kumite Iti e Ni
BUNKAI KATA gekisai iti
BUNKAI KATA gekisai ni
BUNKAI KATA Saifa
Nanahon Kumite
Neko ashi Dachi Kumite
Jyu Kumite', 2);
