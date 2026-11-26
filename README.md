# UI/UX Agent Kit — Claude Code (v0.1 pilot)

Bu paket **yalnızca UI/UX üretim ve kalite kontrol süreci** içindir. Backend mimarisi, endpoint, veritabanı, authentication veya iş mantığı üretmez/değiştirmez.

## Kurulum — mevcut projeyi bozmadan

1. ZIP içindeki `.claude/` ve `ui-system/` klasörlerini **mevcut projenin köküne birleştirerek** kopyala. Var olan dosyaları otomatik olarak değiştirme. Yeni bir repo açıyorsan aynı işlemi orada yap.
2. Projenin mevcut `CLAUDE.md` dosyasını silme veya üzerine yazma. İstersen `ui-system/CLAUDE_SNIPPET.md` dosyasındaki kısa ek bölümü mevcut dosyanın sonuna ekle. Bu adım opsiyonel ama önerilir.
3. Claude Code'u **proje kökünde** çalıştır ve `/ui-pilot` komutunu yaz. Portföy testi için `ui-system/pilots/portfolio/brief.md` dosyasını temel almasını söyle.
4. İlk üç **çalışan, ekran görüntüsü alınmış konsepti** gördükten sonra yalnızca birini seç. Seçim olmadan tam site implementasyonuna geçilmemeli.
5. Uygulama sonrası `/ui-review` ile bağımsız görsel denetim iste.

> Figma Pro, Figma MCP veya ücretli bir tasarım aracına bağımlı değildir. Mevcut frontend stack korunur. Playwright kullanımı için proje ortamında Playwright ve Chromium erişimi gerekir; değilse manuel tarayıcı ekran görüntüsü sağlanır ve otomatik testler 'çalıştırılmadı' olarak raporlanır.

## Mimari

- `.claude/skills/ui-pilot/SKILL.md`: **ana Claude oturumunun** yönettiği iş akışı. Ajanlar birbiriyle plansız biçimde konuşmaz; tüm devirleri ana oturum yapar.
- `.claude/agents/ux-researcher.md`: gerçek kullanıcı ihtiyacını, içerik ve referansları inceler; kod yazmaz.
- `.claude/agents/ui-art-director.md`: 3 farklı görsel yön ve gerekçelerini tasarlar; kod yazmaz.
- `.claude/agents/ui-crafter.md`: seçilen yönü ve küçük konsept prototiplerini kodlar; izinli UI dosyaları dışında işlem yapmaz.
- `.claude/agents/ui-visual-auditor.md`: ekran görüntülerini, test raporunu ve kullanıcı akışlarını **bağımsız** değerlendirir; kod yazmaz.
- `.claude/skills/ui-review/SKILL.md`: ekran görüntüleri, kritik QA kontrolleri, düzeltme döngüsü.
- `ui-system/templates/`: her proje için doldurulacak kısa brief ve ölçüm kartları.
- `ui-system/pilots/portfolio/brief.md`: ilk deneme için portföy + CV + projeler + blog taslak briefi.
- `ui-system/tools/capture.mjs`: Playwright kuruluysa otomatik ekran görüntüsü ve basit tarayıcı raporu.

## Koruma sınırları

- Başlangıçta `ALLOWED_UI_PATHS` ve `PROTECTED_PATHS` kullanıcıya açık biçimde listelenir; varsa repodaki gerçek dizinler kullanılır, tahmini yol atanmaz.
- Backend, API, database, migration, infra, auth, secret, deployment ve business-logic dosyalarına dokunulmaz. UI'nin veri ihtiyacı varsa bir **arayüz sözleşmesi önerisi** yazılır; endpoint yapılmaz.
- Bir prompt **gerçek dosya erişim kısıtı değildir**. Daha sert güvenlik gerekiyorsa repo izinleri, git worktree, sandbox veya deny kuralları ayrıca uygulanmalıdır. Her uygulama turunun sonunda diff incelenir.
- Proje gerçeği olmayan deneyim, başarı, metrik, müşteri referansı, sertifika, CV veya ürün özellikleri **uydurulmaz**. Eksikse işaretlenir/gizlenir.
- AI slop'u sıfırlama garantisi yoktur. Sistem, benzerliği düşürmek için kanıt, görsel prototip, negatif örnek ve eleştiri kullanır.

## Pilot nasıl değerlendirilecek?

Mevcut çalışma yöntemine kıyasla: kullanıcı müdahale sayısı, tasarımın ayırt ediciliği, görev/ürün uyumu, erişilebilirlik, mobil sorunlar, düzeltme sayısı ve toplam uğraş kaydedilir. Başarılı ilk portföy denemesi **farklı iki projede daha** tekrar doğrulanmadan 'her projede çalışıyor' denmez.

## Yararlı resmi dokümanlar (24 Kasım 2026'da incelendi)

- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/best-practices

## Çalıştırma notu

Daha önce kullanılmamış agents/skill dosyaları için Claude Code oturumunu yeniden başlatmak keşif sorunlarını azaltır. `/doctor prompt-audit` ile talimat çakışmalarını denetleyebilirsin (uyumlu Claude Code sürümünde). Bu paket statik olarak kontrol edilmiştir; **henüz senin gerçek portföy projen üzerinde çalıştırılmadı**.
