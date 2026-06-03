# TarotFlow Card Image Downloader
# Downloads all 78 Rider-Waite-Smith cards (public domain, 1909)

$baseUrl = "https://www.dungeon.church/content/images/size/w600/2025/03"
$outDir = "f:\Projects\TarotFlow\assets\cards"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$cards = @{
    # Major Arcana
    "major_00_the_fool" = "tarot-major-0-42043244c79fc1b1.jpg"
    "major_01_the_magician" = "tarot-major-1-6476367511504b5f.jpg"
    "major_02_the_high_priestess" = "tarot-major-2-a6def1e2445cdf9f.jpg"
    "major_03_the_empress" = "tarot-major-3-85cd590a7e0e6ec7.jpg"
    "major_04_the_emperor" = "tarot-major-4-7380b1904f48ffd0.jpg"
    "major_05_the_hierophant" = "tarot-major-5-98e0942b64b895b5.jpg"
    "major_06_the_lovers" = "tarot-major-6-3baa3420cca38224.jpg"
    "major_07_the_chariot" = "tarot-major-7-6731bdd32ad34906.jpg"
    "major_08_strength" = "tarot-major-8-7cf26f5fbe905cd4.jpg"
    "major_09_the_hermit" = "tarot-major-9-6f1f533055ff354a.jpg"
    "major_10_wheel_of_fortune" = "tarot-major-10-6600306b7ecf8a76.jpg"
    "major_11_justice" = "tarot-major-11-4fc0a82e38a5972a.jpg"
    "major_12_the_hanged_man" = "tarot-major-12-3a8ccf98db7d04a8.jpg"
    "major_13_death" = "tarot-major-13-23b8be15633f8945.jpg"
    "major_14_temperance" = "tarot-major-14-0aed89c9e8b7108d.jpg"
    "major_15_the_devil" = "tarot-major-15-b311203f411df750.jpg"
    "major_16_the_tower" = "tarot-major-16-826d59a7b1468820.jpg"
    "major_17_the_star" = "tarot-major-17-5fb78a5f37a972db.jpg"
    "major_18_the_moon" = "tarot-major-18-2364d8ac56751bf1.jpg"
    "major_19_the_sun" = "tarot-major-19-d40d8ea7f0c0c263.jpg"
    "major_20_judgement" = "tarot-major-20-db753a49ab7633ea.jpg"
    "major_21_the_world" = "tarot-major-21-734e52338d055159.jpg"
    # Swords
    "swords_01" = "tarot-swords-1-3bebb8eeba6e380e.jpg"
    "swords_02" = "tarot-swords-2-baada4175898facc.jpg"
    "swords_03" = "tarot-swords-3-7769531aa9f1c61e.jpg"
    "swords_04" = "tarot-swords-4-25d9de390a29de87.jpg"
    "swords_05" = "tarot-swords-5-cd19407493650ef3.jpg"
    "swords_06" = "tarot-swords-6-9b49b2d0df8fd94c.jpg"
    "swords_07" = "tarot-swords-7-0012ca665760cc00.jpg"
    "swords_08" = "tarot-swords-8-66463d63544d0b04.jpg"
    "swords_09" = "tarot-swords-9-b4641fcbe203aaac.jpg"
    "swords_10" = "tarot-swords-10-e3e1dcc9a0cd3831.jpg"
    "swords_page" = "tarot-swords-page-3969579bdf9f3487.jpg"
    "swords_knight" = "tarot-swords-knight-1834928f1e0a2c37.jpg"
    "swords_queen" = "tarot-swords-queen-094d119544105d0e.jpg"
    "swords_king" = "tarot-swords-king-4730912676aa261e.jpg"
    # Pentacles
    "pentacles_01" = "tarot-pentacles-1-c9717ee444f022c8.jpg"
    "pentacles_02" = "tarot-pentacles-2-fecc845d1b47cae3.jpg"
    "pentacles_03" = "tarot-pentacles-3-564b52d68b30af6f.jpg"
    "pentacles_04" = "tarot-pentacles-4-4539fa68ac06a0ee.jpg"
    "pentacles_05" = "tarot-pentacles-5-d71b72fea7ad7ef1.jpg"
    "pentacles_06" = "tarot-pentacles-6-c9deebe03464bc89.jpg"
    "pentacles_07" = "tarot-pentacles-7-7d6a771308e7653c.jpg"
    "pentacles_08" = "tarot-pentacles-8-b9042623182f81ee.jpg"
    "pentacles_09" = "tarot-pentacles-9-9f7887ee1d7a3d5a.jpg"
    "pentacles_10" = "tarot-pentacles-10-3edd405c64ee5ac6.jpg"
    "pentacles_page" = "tarot-pentacles-page-2bc9a735017ce3a1.jpg"
    "pentacles_knight" = "tarot-pentacles-knight-c4402bd564aa8470.jpg"
    "pentacles_queen" = "tarot-pentacles-queen-1efbbba3b2e5785a.jpg"
    "pentacles_king" = "tarot-pentacles-king-6ca7fff779642736.jpg"
    # Cups (verified hashes)
    "cups_01" = "tarot-cups-1-d8e46960f2d01cef.jpg"
    "cups_02" = "tarot-cups-2-5c16b1eee7be3a85.jpg"
    "cups_03" = "tarot-cups-3-b45bfaf88420f08d.jpg"
    "cups_04" = "tarot-cups-4-0b3423ddf359d29a.jpg"
    "cups_05" = "tarot-cups-5-d63660523a5bcc14.jpg"
    "cups_06" = "tarot-cups-6-35074e29b815389e.jpg"
    "cups_07" = "tarot-cups-7-cd1a33ccd50675a0.jpg"
    "cups_08" = "tarot-cups-8-7ffb70edf13aea94.jpg"
    "cups_09" = "tarot-cups-9-13550c8d73cf9316.jpg"
    "cups_10" = "tarot-cups-10-916a3c6dc2dc65a5.jpg"
    "cups_page" = "tarot-cups-page-4bb3c5ed72a7237b.jpg"
    "cups_knight" = "tarot-cups-knight-d07f26d2681a7e25.jpg"
    "cups_queen" = "tarot-cups-queen-5ae87d65330a6302.jpg"
    "cups_king" = "tarot-cups-king-360de400f73f60c9.jpg"
    # Wands (verified hashes)
    "wands_01" = "tarot-wands-1-e65bc5ba30713d17.jpg"
    "wands_02" = "tarot-wands-2-c53d8db32b75d99f.jpg"
    "wands_03" = "tarot-wands-3-263680b54479fb61.jpg"
    "wands_04" = "tarot-wands-4-7b6f3c47d0bd91a4.jpg"
    "wands_05" = "tarot-wands-5-be3e44530c03e68e.jpg"
    "wands_06" = "tarot-wands-6-6f0f6951c033eadd.jpg"
    "wands_07" = "tarot-wands-7-e6e2507530b17dd9.jpg"
    "wands_08" = "tarot-wands-8-2705aa8da47e46bc.jpg"
    "wands_09" = "tarot-wands-9-e6658378c0b1a109.jpg"
    "wands_10" = "tarot-wands-10-c8127457564eb842.jpg"
    "wands_page" = "tarot-wands-page-f46491339b2fd87f.jpg"
    "wands_knight" = "tarot-wands-knight-90a605be684f6379.jpg"
    "wands_queen" = "tarot-wands-queen-08b3b5bd681695d5.jpg"
    "wands_king" = "tarot-wands-king-177d091d45642b29.jpg"
}

$total = $cards.Count
$i = 0
$failed = 0
foreach ($entry in $cards.GetEnumerator()) {
    $i++
    $outFile = Join-Path $outDir "$($entry.Key).jpg"
    if (Test-Path $outFile) {
        Write-Host "[$i/$total] SKIP $($entry.Key) (exists)"
        continue
    }
    $url = "$baseUrl/$($entry.Value)"
    Write-Host "[$i/$total] $($entry.Key)..." -NoNewline
    try {
        Invoke-WebRequest -Uri $url -OutFile $outFile -UseBasicParsing
        Write-Host " OK" -ForegroundColor Green
    } catch {
        Write-Host " FAIL" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nDone! $($total - $failed)/$total cards downloaded to $outDir"
