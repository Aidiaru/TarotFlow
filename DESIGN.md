# TarotFlow — Mimari Tasarım Notu

> Durum: taslak. 2026-08-18 tarihli tasarım oturumunun çıktısı.
> Bu belge kodun mevcut halini **tarif etmez**, hedeflenen mimariyi tarif eder.

---

## 0. Ürün tezi

TarotFlow bir fal uygulamasıdır. Tarot bir kılıf değil; kartların gerçek anlamları
gerçekten kullanılır.

Falcıyı falcı yapan şey geleceği bilmek değil, **çok anlamlı bir kartın hangi anlama
geldiğini seçebilmektir**. Bu seçim üç girdiyle yapılır:

1. **Bağlam** — kullanıcının sorusu ve verdiği durum bilgisi
2. **Kullanıcının kim olduğu** — "enerji" okuma
3. **Açılım içi bağlam** — diğer kartların karşılıklı kısıtlaması

LLM'ler (1)'i iyi, (3)'ü zorlanarak, **(2)'yi çok kötü** yapıyor. (2) hem en kritik
olan hem de ürünün savunulabilir kısmı. Dolayısıyla bu projenin asıl mühendislik
problemi tarot yorumu değil, **kalıcı kullanıcı modelleme katmanıdır**.

### Temel ilke

Kullanıcı modelinin çıktısı bir **psikolojik profil metni değil**, bir
**disambiguation prior**'dır.

> Test: aynı soru + aynı açılım, iki farklı kullanıcı → yorum gerçekten ayrışıyor mu?
> Ayrışmıyorsa kullanıcı modeli çalışmıyordur.

---

## 1. En kritik kural: sıralama

```
YANLIŞ:  kart çek → tema çıkar → retrieval → yorumla
DOĞRU:   profil yükle (kartlardan bağımsız) → kart çek → o sabit lensten yorumla
```

Kullanıcı modeli **rastgelelik devreye girmeden önce donar**. Lens kartlara doğru
kayamaz, dolayısıyla kartlar gerçekten kısıt haline gelir.

Retrieval'ı çekilen kartlara koşullamak, yalnızca doğrulayıcı kanıt bulabilen bir
sistem üretir — rastgele gürültüden tutarlılık imal eden bir makine. Bu prompt'la
düzeltilemez, mimaridir.

**Kural:** episodik arşiv araması **her zaman kullanıcının sorusuna** koşullu olur,
asla çekilen kartlara değil.

---

## 2. Kullanıcı modeli — üç katman

### 2.1 Facts (olgular)
Bi-temporal, çözümlenmiş. Yaş, iş, ilişki durumu, isimli kişiler ve rolleri
("Ayşe = eski sevgili, ayrılık 2026-03"), süregelen durumlar.
`valid_from` / `invalidated_at`.

Append-only **olmayacak**. Çelişen olgular çözülür, yan yana birikmez.

> Falcının kız kardeşinin adını hatırlaması, bağlanma stilini bilmesinden daha değerlidir.

### 2.2 Dispositions (eğilimler) — asıl IP
Teşhis değil, **kart anlamı çeviren eksenler**. Bkz. §3.

### 2.3 Open threads (açık konular)
Şu an hayatında canlı olan konular, decay saatiyle.
"İş arama, 2026-08, çözülmedi."

Ürünün en güçlü anını bu katman üretir:
*"Geçen ay iş aramaktan bahsetmiştin, o nasıl gidiyor?"*

---

## 3. Eksenler (axes)

### Tanım
Bir kartın hangi anlama geleceğini belirleyen, kişiye ait, iki kutuplu soru.

Eksenler psikoloji literatüründen değil, **kartlardan geriye doğru** türetilir:
kart al → çelişen iki anlamını yaz → "bu kişi hakkında ne bilseydim seçebilirdim?"
→ cevabı iki kutup olarak yaz.

### Taslak eksenler (DOĞRULANMADI)

| Eksen | Kutuplar | Çevirdiği kartlar |
|---|---|---|
| fail konumu | edilgen ↔ etken | Kader Çarkı, Kılıç Üçlüsü, Adalet, Asılan Adam |
| ilişkisel duruş | yaklaşan ↔ uzaklaşan | Kupa Sekizlisi, Ermiş, Aşıklar |
| zaman yönelimi | geçmişe tutunan ↔ geleceğe kaygılı | Kupa Altılısı, Kupa Dörtlüsü |
| yıkım iştahı | tehdit ↔ ferahlama | Kule, Ölüm |
| arzuya izin | suçluluk ↔ meşruiyet | Şeytan, Kupa Yedilisi |
| otoriteyle ilişki | boyun eğen ↔ karşı duran | İmparator, Başrahip |

> Bu liste bir taslaktır ve tarot pratiğine göre doğrulanacaktır.
> Özellikle süit/element geleneğinden gelen bir eksen eksik olabilir.

### Testler
- **≥3 kartı çeviriyor mu?** Hayırsa çok dar, eksen değil.
- **Her kartı çeviriyor mu?** Evetse çok muğlak, Barnum üretir.
- Toplam **5–8 anlam ekseni**. Fazlası ölçülemez.

### Eksen kardinalitesi — ikili şart değil

İki tip eksen kabul edilir:

| Tip | Örnek | Ne zaman |
|---|---|---|
| **Bipolar** (tercih edilen) | `fail_konumu: edilgen ↔ etken` | Gerçek bir zıtlık varsa |
| **Kategorik** (n-ary) | `baskın_element: kupa \| kılıç \| değnek \| tılsım` | Zıtlık değil, farklılık varsa |

Teknik kısıt tek: **değer kümesi kapalı olacak** ve **yaşayan bir alternatifi olacak**.
Bipolar ikisini de bedavaya sağlar.

**Bipolar neden tercih edilir:** zıt kutuplarda bir kutbu destekleyen kanıt otomatik
olarak diğerini zayıflatır — gözlem başına bedava yalanlama sinyali. 4'lü kategorikte
"kupa" lehine kanıt, üç alternatifi seyreltilmiş biçimde zayıflatır, öğrenme yavaşlar.

**Ama sahte zıtlık uydurma.** Gerçek bir karşı kutup adlandıramıyorsan eksen
kategoriktir; zorlama "etken ↔ ???" çöp üretir.

### Kutup ≠ anlam (sense)
Karıştırılmaması gereken iki şey:
- **Sense**: kartın bir anlamı. Her zaman kategorik, zıt olmak zorunda değil.
  Kılıç Üçlüsü → `affedememe`, `affetme`, `acı verici gerçek`, `yas`
- **Pole**: bir eksenin bir ucu, kişiye ait bir parametre.

Bir kutup **birden fazla sense** seçebilir. Ve her sense bir eksene bağlı olmak
zorunda değil — bazıları soru bağlamından veya komşu kartlardan seçilir.

### Anlam ekseni ≠ teslimat tercihi
- **Anlam eksenleri** (5–8): hangi anlamın seçileceğini belirler. Kanıt: kullanıcının
  anlattıkları.
- **Teslimat tercihleri** (2–3): aynı anlamın nasıl söyleneceğini belirler
  (sertlik toleransı, uzunluk, doğrudanlık). Kanıt: kullanıcının **davranışı** —
  hangi okumayı kaydetti, nerede uygulamayı kapattı, hangi paragrafı tekrar okudu.

Ayrı tutulurlar çünkü kanıt kaynakları farklı ve ikincisi çok daha güvenilir.

### Neden liste kapalı olmak zorunda
Serbest metin olursa sistem onaylayamaz, yalanlayamaz, devralamaz, sayamaz.
§4'teki tüm zaman makinesi **kapalı sözlük olmadan çalışmaz**.
Eksen listesi = `dispositions.axis` kolonundaki enum.

---

### Eksen kaydı formatı (teslim formatı)

Eksen listesi tarot pratiğinden üretilecek. Her eksen aşağıdaki formatta teslim
edilir — serbest metin kabul edilmez, çünkü doğrudan `dispositions.axis` enum'una
ve sinyal çıkarma prompt'una dönüşecek:

    eksen_id: fail_konumu                    # snake_case, sabit
    kutuplar: edilgen <-> etken              # veya kategorik değer listesi
    domainler: [aşk, kariyer, aile]          # hangi alanlarda geçerli
    çevirdiği_kartlar:                       # en az 3
      - Kader Çarkı:  "kader müdahale etti" | "bunu sen başlattın"
      - Kılıç Üçlüsü: "affedememe"          | "affetme"
      - Adalet:       "hak ettiğini buluyorsun" | "hesap vermen gerekiyor"
    gözlenebilir_işaretler:                  # sinyal çıkarma prompt'u bunu kullanır
      - "başıma geldi / denk geldi" tarzı edilgen çatı
      - olayı anlatırken kendi kararını atlaması
    yalanlayan_kanıt:                        # ZORUNLU — en çok atlanan alan
      - kendi hatasını sorulmadan kabul etmesi
      - bir sonucu kendi seçimine bağlaması

Son iki alan zorunludur. `gözlenebilir_işaretler` olmadan sinyal çıkarılamaz;
**`yalanlayan_kanıt` olmadan §4.2 (asimetrik kanıt) ve §4.3 (sessiz yalanlama)
hiç çalışmaz** — sistem yalnızca onay toplar, yine bir bias makinesi olur.

## 4. Temporal model (soyut veri için)

Somut olgunun açık bir geçersizleşme olayı vardır ("Londra'ya taşındım").
Psikolojik niteliğin yoktur. Dört mekanizma gerekir.

### 4.1 Durum / eğilim ayrımı

| | Durum (state) | Eğilim (trait) |
|---|---|---|
| Ölçek | gün–hafta | ay–yıl |
| Varsayılan | **süresi dolar** | kalıcı, zor değişir |
| Yazma eşiği | düşük | çok yüksek |

**Terfi kuralı:** `≥2 farklı bağlam` **ve** `≥2 ayrı seans` **ve** `≥2 hafta arayla`
→ durum eğiliме terfi eder. Aksi halde durum kalır ve söner.

Bu kural olmadan kötü bir hafta, kişilik ilan edilir.

### 4.2 Asimetrik kanıt
Onay yavaş yükseltir, yalanlama hızlı düşürür. Eğilim iddiası yarı-evrensel bir
iddiadır; tek karşı örnek, bir onaydan daha bilgilendiricidir.

**Kritik:** asimetri, kullanıcının tepki verdiği **spesifik iddiaya** uygulanır.
Rastgele son N gözleme uygulanmaz.

### 4.3 Sessiz yalanlama (silent disconfirmation)
Decay `Δgün` ile değil, **fırsat sayacıyla** işler.

- Kullanıcı 3 aydır ilişkilerden bahsetmediyse → eğilim sönmez, veri yok o kadar.
- 8 ilişki konuşması geçmiş ve hiçbirinde tetiklenmemişse → gerçek yalanlama.

`opportunities_missed / opportunities_total` düşerse eğilim `dormant` olur, silinmez.

### 4.4 Devralma (supersession), silme değil
```
2026-03  ilişkisel_duruş: uzaklaşan   [superseded_by ↓]
2026-08  ilişkisel_duruş: yaklaşan    [supersedes ↑, trigger: ayrılık]
```
Tarotta **değişimin kendisi en değerli okuma malzemesidir**. Üzerine yazarsan kaybolur.

### 4.5 Alan etiketi
Her eğilim bir `domain` taşır: `aşk / kariyer / aile / benlik`.
**Asla global değil.** Biri aşkta kaçıngan, işte atılgan olabilir.

### 4.6 Kayıt şekli
```
axis: "belirsizlik_tepkisi"      // kapalı enum
pole: "eylemsizlik"
domain: "kariyer"
tier: state | trait
strength: 0.6
status: active | dormant | superseded
contexts_seen / sessions_seen / opportunities_missed
competing: { pole: "aceleci hamle", strength: 0.2 }   // ZORUNLU
evidence: [{ session, alıntı, tarih, confirm|disconfirm|silent|user_correction }]
superseded_by / first_seen / last_confirmed
```

`competing` alanı zorunludur. 0.5 üstü her eğilimin yaşayan bir rakibi olur —
anti-bias mekanizması veri modelinde, promptta değil.

---

## 5. Sıcak yol / soğuk yol

### Sıcak yol (kullanıcı bekliyor) — 1 LLM çağrısı
1. Önceden hesaplanmış profil bloğunu yükle (~400–600 token, tam halde, **RAG yok**)
2. Kart çek
3. Yorumla

### Soğuk yol (dreaming) — kuyruk + gecelik cron
Sinyal çıkarma, konsolidasyon, tahmin skorlama, temporal rewrite, thread güncelleme.

**Neden gecelik, neden sinyal sayısı değil:** konsolidasyonun değeri zamansal
mesafeden gelir. Seans ortasında tetiklenen bir konsolidasyon, aynı anın 5 parçasını
özetler — bu konsolidasyon değildir. Gecelik job son 24 saati değil, **açık
hipotezleri** dolaşır.

### Dreaming'in asıl işi: silmek
Başarı metriği "kaç içgörü üretti" değil, **"kaç kaydı birleştirdi / düşürdü"**.
Sadece büyüyen bir hafıza sistemi 6 ayda çöker.

---

## 6. Doğrulama — onay değil, tahmin

`+0.1 / -0.15` yerine:

1. Okuma gösterilmeden önce sistem **gizli bir tahmin** commit eder:
   *"eğer fail_konumu=edilgen doğruysa, bu kullanıcı karşı tarafın ne düşündüğünü soracak."*
2. Gerçek cevap bu tahmine karşı skorlanır.
3. Yalnızca tutan tahminler confidence yükseltir.

**Neden onay kötü bir sinyal:** tarot yorumuna katılmak Barnum etkisine tabidir.
Yorum ne kadar muğlaksa kullanıcı o kadar "evet aynen" der. Ham onayı ödüllendiren
bir döngü, kendi muğlaklığını ödüllendirir.

### Barnum regresyon testi (CI'a girer)
Gerçek bir seansı al, profili **başka bir kullanıcınınkiyle** değiştir, okumayı
yeniden üret. Okuma değişmiyorsa Barnum'dur, profil iş yapmıyordur.

---

## 7. Kart bilgisi: RAG değil, sense tablosu

78 kart × rakip anlamlar = statik tablo. Yalnızca çekilen kartların satırları
enjekte edilir.

### Tablonun eksenlerle ilişkisi
Aynı veri iki işe yarar:

1. **Türetme anında (offline, bir kez):** §3'teki egzersizin 1. ve 2. adımı
   (kart al → rakip anlamlarını yaz) tam olarak bu tablodur. Yani tablo,
   eksenleri bulmanın **girdisidir**.
2. **Çalışma anında:** eksenler netleşince her sense, kendisini seçen
   `eksen + kutup` ile etiketlenir. Nihai artefakt eksenlerle **anotasyonlu** tablodur:

```
Kılıç Üçlüsü
  ├ affedememe        ← fail_konumu = edilgen
  ├ affetme           ← fail_konumu = etken
  ├ acı verici gerçek ← eksen yok; soru bağlamından
  └ yas               ← eksen yok; komşu karttan
```

Eksensiz tablo bir sözlüktür. Tablosuz eksen üzerinde iş yapacak bir şey bulamaz.

### Ters kartlar kaldırıldı — karar

Deste **yalnızca düz** okunur. `is_reversed` üretilmez.

**Gerekçe (mimari, estetik değil):** ters kart, kullanıcı modeliyle **yarışan ikinci
bir rastgele disambiguation kanalıdır**. Kılıç Üçlüsü ters zaten "affetme" demekse,
profilin seçmesi gereken şeyi yazı-tura seçmiş olur. Ters kartları kaldırmak, kullanıcı
modelini **birincil anlam seçici** yapar — ki ürünün tüm tezi budur.

Ek faydalar: sense uzayı 156 durumdan 78 satıra iner; tablo, eval ve prompt küçülür.

Kaybedilen ifade gücü **pozisyon + komşu kart** (girdi #3) ile karşılanır — hem
geleneksel cevap budur, hem de LLM'lerin zayıf olduğu yer orasıdır, yani yatırım
oraya yapılmalı. Yazı-turaya değil.

> İleride görsel/ritüel sebeple geri istenirse, anlam çeviren değil **yoğunluk
> ayarlayan** bir modifier olarak döner. Anlam çevirici olarak asla.

Model her kart için **bir anlam seçmeye zorlanır**, yapılandırılmış çıktıyla:

```json
{
  "card": "Kılıç Üçlüsü",
  "chosen_sense": "affedememe",
  "competing_sense": "affetme",
  "why": "profil.fail_konumu=edilgen + soru bağlamı 'o bana yaptı'"
}
```

Serbest metin `internal_monologue` ölçülemez. Yapılandırılınca profilin gerçekten
disambiguation yapıp yapmadığı **sayılabilir** — hem eval yüzeyi, hem ileride
"bu yorumu neden yaptın?" ürün özelliği.

---

## 8. Sunum katmanı — tek yönlü projeksiyon

Kullanıcıya profil **tarotun kendi diliyle** gösterilir (significator / saray kartı /
süit dengesi), klinik dille değil:

> "Senin kartın şu an Kılıç Kraliçesi. Kupa tarafın zayıf, Değnek tarafın uykuda."

### Mimari kural (ihlal edilmez)
```
dispositions  ──(render-time, tek yön)──>  saray kartı gösterimi
```
- Projeksiyon **okuma anında** hesaplanır, saklanmaz.
- Gösterim katmanı depoya **asla geri yazmaz**.
- Kullanıcı düzeltirse ("hayır ben Kılıç'ım") bu **doğrudan eksen değeri olarak
  yazılmaz**; `evidence` tablosuna `user_correction` tipiyle bir satır olarak düşer
  ve normal kanıt hattından geçer.

Böylece sunum tercihi altyapı verisini kirletmez, ama düzeltme sinyali de kaybolmaz.

### Neden bu tercih edildi
1. Büyü bozulmaz, derinleşir — "analiz ediliyorum" değil, "falcı beni tanıyor".
2. Paylaşılabilir/viral yüzey (burç paylaşımının tarot karşılığı).
3. Bedava ground truth.
4. **Hukuki yüzey değişir:** klinik sözlük (şema, savunma mekanizması, DSM/Young
   terminolojisi) GDPR özel nitelikli veri olarak okunur. Davranışsal eğilim dili
   okunmaz. Klinik terminoloji kod tabanından tamamen çıkar — promptlar, kolon
   adları, loglar dahil.

---

## 9. Tech stack

| Katman | Karar | Gerekçe |
|---|---|---|
| Uygulama | **Expo + EAS** | iOS + Android + web tek kod, OTA güncelleme |
| Abonelik | **RevenueCat** | freemium kategori, kendin yazma |
| Backend | **Supabase** (kal) | bkz. aşağı |
| Kuyruk | **Supabase Queues (pgmq)** | Postgres eklentisi, ek servis/fatura yok |
| Zamanlama | **pg_cron** | aynı |

### Neden Convex değil
1. Veri modeli ilişkisel ve temporal (supersession zincirleri, evidence join'leri,
   zaman penceresi sorguları) — Postgres'in evi.
2. Convex'in scheduling avantajı, Supabase Queues + pg_cron ile kapandı.
3. Yeni backend paradigması öğrenmek "altyapıyla uğraşmama" hedefinin zıddı.

### Maliyet notu
Kuyruk pahalı değil — pgmq bir Postgres eklentisidir, mesajlar kendi
veritabanındaki tablolardadır. Gerçek maliyet kalemi **LLM token'ı**, ve asenkrona
geçmek maliyeti *düşürür* (mesaj başına 5–8 çağrı yerine kullanıcı başına günde
1 toplu tur).

### Model katmanı
Çıkarma/sınıflandırma → ucuz-hızlı model. Yalnızca okuma çağrısı → güçlü model.
Okuma çağrısı için birkaç modeli aynı seansla yan yana koyup **ses kalitesine göre**
seç; ürünün kendisi o ses.

---

## 10. Mevcut koddan ne yakılır, ne kalır

### Yakılır
- Kart-güdümlü RAG (`tarot-reading/index.ts:311-347`) — confirmation bias kaynağı
- Şema / savunma / core-belief klinik sözlüğü
- `±confidence` hack'i (`:262-283`) — mekanizma doğru, hedefleme yanlış
- Append-only `user_memory` (`:586`)
- Request path'indeki konsolidasyon (`:623-809`)
- Ayrı `session-reflection` fonksiyonu → dreaming job'ına katlanır
- `is_reversed: Math.random() > 0.5` (`:97`) — bkz. §7, ters kartlar kaldırıldı

### Yeniden yazımda MUTLAKA düzeltilecek
- **`drawCards` karıştırması bozuk** (`tarot-reading/index.ts:94`):
  `[...TAROT_DECK].sort(() => Math.random() - 0.5)` düzgün dağılmayan bir permütasyon
  üretir — bazı kartlar sistematik olarak daha sık gelir. Fisher-Yates ile değiştirilecek.
  Bu kozmetik değil: §1'in tamamı "kartlar gerçek bir kısıt olsun" üzerine kurulu,
  çekim yanlıysa kısıt da yanlıştır.

### Tutulur
- Expo kabuğu, kart görselleri, UI
- Gizli akıl yürütme + tek görünür çıktı ayrımı
- **Baseline behavior filtresi** (`:490-498`) — "herkes geleceği sorar, bu sinyal
  değil" içgörüsü doğru, yeni mimaride de kalır
- Türkçe ton çalışması

---

## 11. Açık konular

- [ ] **Eksen listesi kesinleştirilecek** (tarot pratiğinden, taslak §3)
- [ ] 78 kart × rakip anlamlar tablosu
- [ ] Postgres şeması: facts / dispositions / threads / evidence + supersession
- [ ] Teslimat tercihleri için hangi davranışsal telemetri toplanacak
- [ ] Well-being / koçluk yüzeyi: gerçekten ship edilecek mi?
      (Edilirse veri toplama meşrulaşır ve ikinci monetizasyon yüzeyi olur.
      Sadece etiket olarak konursa mağaza politikası ve GDPR amaç sınırlaması riski.)

---

## 12. Çalışma bölüşümü ve durum

### Bölüşüm
- **Eksen listesi → Orçun.** Tarot bakan biri olduğu için ekseni pratikten
  üretecek; ayrı bir oturumda hazırlayıp review'a getirecek. §3'teki formatta.
- **78 kart × rakip anlamlar tablosu → Claude.** §3'teki türetme egzersizinin
  1. ve 2. adımını hazır vermek için. Düz kartlar (ters yok), Türkçe.
- **Şema + migration'lar → Claude.** Eksen listesi kesinleştikten sonra.
  Write yetkisi var ama migration'lar yine de dosyaya yazılıp git'e girecek —
  `git revert` veritabanını geri getirmez, o yüzden değişiklikler izlenebilir kalsın.
- **Push → her zaman Orçun'un onayıyla.** Commit serbest, push değil.

### Doğrulanmayı bekleyen
- §3'teki taslak eksenler Claude'un önerisi, tarot pratiğine göre **doğrulanmadı**.
  Muhtemelen bir kısmı düşecek; süit/element geleneğinden gelen bir eksen eksik olabilir.
- Kart tablosu dili: Türkçe (nüanslar Türkçe düşünülüyor, kullanıcıya giden metin de Türkçe).

### Altyapı durumu (2026-08-19)
- Supabase MCP bağlı, `--project-ref=jjxodpqqfyvevjuovndw`, yazma yetkili.
- Remote Control tüm oturumlar için açık (`/config`).
- Worktree kaldırıldı; tek çalışma ağacı `F:/Projects/TarotFlow`.
- `master` = `origin/master` = `3e2e56b`. Tez/sunum PDF'leri repoda ve GitHub'da.
- Çalışma ağacı temiz. Edge function'lardaki deneysel değişiklikler geri alındı
  (nasılsa yeniden yazılacak), Codex artıkları silindi.

### Sıradaki adımlar
1. Canlı Supabase şemasını incele (tablolar, `search_clinical_observations` RPC,
   birikmiş veri) → neyin migrate edileceğine, neyin atılacağına karar ver
2. 78 kart × rakip anlamlar tablosu
3. Eksen listesi kesinleşince yeni şema + migration

---

## 13. Mevcut sistemden ampirik bulgular (2026-08-19, canlı DB)

7 kullanıcı, 25 seans, 179 mesaj, 75 açılım, 89 gözlem, 52 fact.
**Bu veri atılmayacak** — elimizdeki tek eval korpusu (Barnum regresyon testi §6,
eksen çıkarımının geriye dönük denenmesi).

### Bulgu 1: append-only `user_memory` çelişki biriktiriyor
Tek bir kullanıcıda (`73a0df88`):

| key | biriken değerler |
|---|---|
| `employment_status` | "unemployed / no post-grad plan" ‖ "looking for a job" ‖ "Employed for 10 months" |
| `relationship_status` | "single / seeking a partner" ‖ "long-term unrequited love" ‖ "unstable or painful connection" ‖ "unresolved breakup dynamic" |
| `education_status` | "near graduation" ‖ "Student graduating in one month" |

Hepsi `tarot-reading/index.ts:301`'de "Chronological Timeline" başlığıyla **aynı anda**
prompt'a giriyor. Model çelişkiyi çözemez, **karta uyanı seçer** — confirmation bias
tam buradan giriyor. Ayrıca `student ‖ Student`: normalizasyon yok.
→ §2.1 (bi-temporal, çözümlenmiş facts) ve §4.4 (devralma) bunu çözer.

### Bulgu 2: LLM'den istenen serbest güven skoru doygunlaşıyor
gate gözlemleri: n=49, ortalama **0.87**, minimum 0.50 — prompt "tentative = 0.3"
demesine rağmen alt uç hiç kullanılmamış. Değişmeyen skor ağırlıklandırma yapamaz.
Buna karşılık konsolidasyon çıktıları 0.40–0.70 arasında kalibre — çünkü orada
açık disiplin kuralları var.

**Ders:** LLM'den havada bir 0–1 güven isteme. Güveni **sayılabilir kanıttan türet**:
`contexts_seen`, `sessions_seen`, confirm/disconfirm/silent sayaçları (§4.6).

### Bulgu 3: `signal_type` taksonomisi pratikte tek kategoriye çökmüş
self_disclosure 49 · behavioral_sequence 3 · communication_style 1.
Konsolidasyondaki SIGNAL WEIGHT HIERARCHY (`index.ts:704-709`) fiilen tek kategori
üzerinde çalışıyor — ölü kod.
→ Yeni tasarımda kategori, modelin serbest seçimi değil, **eksen kaydının kendi
alanlarından** (§3 teslim formatı) türeyecek.
