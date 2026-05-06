<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[660px] max-h-[92vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">
      
      <!-- Header -->
      <div class="px-4 py-3 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-2">
          <span class="text-xl">📚</span>
          <span class="text-sm tracking-widest">RİSK YÖNETİMİ BİLGİ BANKASI (PMBOK®)</span>
        </div>
        <button @click="$emit('close')" class="hover:text-red-400 text-lg">✖</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2 flex-wrap" :style="{ borderColor: theme.titleBarBg }">
        <button v-for="tab in tabs" :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-1 py-2 text-xs transition-colors"
                :style="activeTab === tab.id ? { backgroundColor: theme.tabActiveBg, color: theme.tabActiveText } : { color: theme.riskDescText }">
          {{ tab.name }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-4 overflow-y-auto pixel-scrollbar flex-1 text-xs"
           style="line-height: 1.7;"
           :style="{ color: theme.riskDescText }">
        
        <!-- TEMELLER TAB -->
        <div v-if="activeTab === 'basics'" class="flex flex-col gap-4">
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">Proje Risk Yönetimi Nedir?</h3>
            <p>Risk, gerçekleşmesi durumunda projenin hedeflerinden en az biri üzerinde (zaman, maliyet, kapsam veya kalite) olumlu veya olumsuz etki yaratacak <strong>belirsiz</strong> bir olay veya durumdur.</p>
          </div>
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">Demir Üçgen (Iron Triangle)</h3>
            <p class="mb-2">Her proje 3 kısıtta dengelenir. Birini değiştirince diğerleri etkilenir:</p>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2 bg-black/40 rounded border border-yellow-900">
                <div class="text-lg">📅</div>
                <div :style="{ color: theme.chipYellowText }">Zaman</div>
                <div class="text-[10px] mt-1">Deadline / Takvim</div>
              </div>
              <div class="p-2 bg-black/40 rounded border border-green-900">
                <div class="text-lg">💰</div>
                <div :style="{ color: theme.chipGreenText }">Maliyet</div>
                <div class="text-[10px] mt-1">Bütçe / Kaynaklar</div>
              </div>
              <div class="p-2 bg-black/40 rounded border border-blue-900">
                <div class="text-lg">🎯</div>
                <div :style="{ color: theme.chipBlueText }">Kapsam</div>
                <div class="text-[10px] mt-1">Özellikler / Kalite</div>
              </div>
            </div>
            <div class="mt-2 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded text-[10px]">
              💡 <strong>Oyunda:</strong> Deadline (süre), bütçe ve moral hepsi bu üçgenin yansımalarıdır.
            </div>
          </div>
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">Risk Yönetimi Süreçleri (PMBOK)</h3>
            <ul class="list-none flex flex-col gap-2">
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">①</span> <div><strong>Tanımlama (Identify):</strong> Hangi risklerin projeyi etkileyebileceğini belirleme → <em>Risk Kaydı oluşturulur</em></div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">②</span> <div><strong>Nitel Analiz:</strong> Olasılık/Etki Matrisi ile hızlı önceliklendirme</div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">③</span> <div><strong>Nicel Analiz:</strong> EMV hesabı ile sayısal değerlendirme</div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">④</span> <div><strong>Yanıt Planlama:</strong> Avoid / Mitigate / Transfer / Accept</div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">⑤</span> <div><strong>İzleme & Kontrol:</strong> Proje boyunca sürekli takip</div></li>
            </ul>
          </div>
        </div>

        <!-- STRATEJİLER TAB -->
        <div v-if="activeTab === 'strategies'" class="flex flex-col gap-4">
          <p class="p-2 bg-black/20 rounded">Tehditlere karşı kullanılan <strong>4 PMBOK stratejisi</strong> ve oyundaki maliyetleri:</p>
          
          <div v-for="s in strategies" :key="s.key"
               class="flex gap-3 items-start p-3 bg-black/30 rounded border border-white/10">
            <div class="text-2xl flex-shrink-0">{{ s.icon }}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-sm" :style="{ color: s.color }">{{ s.title }}</h4>
                <span class="text-[10px] px-2 py-0.5 rounded" :style="{ backgroundColor: s.color + '22', color: s.color }">{{ s.cost }}</span>
              </div>
              <p class="text-[10px] mb-2">{{ s.desc }}</p>
              <div class="p-2 bg-black/30 rounded text-[10px]" :style="{ borderLeft: '3px solid ' + s.color }">
                <strong>Örnek:</strong> {{ s.example }}
              </div>
              <div class="mt-1 text-[10px]" :style="{ color: theme.chipGreenText }">
                🎮 Oyunda: {{ s.game }}
              </div>
            </div>
          </div>

          <div class="p-3 bg-black/30 rounded border border-yellow-800/30">
            <h4 class="text-xs mb-2" :style="{ color: theme.chipYellowText }">⚠️ Fırsatlar için Stratejiler (Pozitif Risk)</h4>
            <ul class="list-disc pl-4 flex flex-col gap-1 text-[10px]">
              <li><strong>Exploit (Kazan):</strong> Fırsatı kesin gerçekleştir (örn: ekstra kaynak ver)</li>
              <li><strong>Enhance (Artır):</strong> Olasılığını/etkisini yükselt</li>
              <li><strong>Share (Paylaş):</strong> Ortakla birlikte değerlen</li>
            </ul>
            <div class="mt-2 text-[10px]">🎮 Oyunda: Yüksek moral → Kritik Başarı = Exploit stratejisi!</div>
          </div>
        </div>

        <!-- METRİKLER TAB -->
        <div v-if="activeTab === 'metrics'" class="flex flex-col gap-4">
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">EMV (Expected Monetary Value)</h3>
            <p class="mb-2">Bir riskin ortalama maliyetini hesaplamak için kullanılan istatistiksel yöntemdir.</p>
            <div class="p-2 bg-black/50 text-center border border-white/20 mb-3 font-bold" :style="{ color: theme.chipGreenText }">
              EMV = Risk Olasılığı (%) × Riskin Etkisi ($)
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-2 bg-red-900/30 border border-red-800/30 rounded">
                <div class="text-[10px] mb-1" :style="{ color: '#f08080' }">Tehlikeli görünen risk:</div>
                <div class="text-[10px]">Olasılık: %10 × Etki: $100,000</div>
                <div class="text-xs mt-1 font-bold text-red-300">EMV = $10,000</div>
              </div>
              <div class="p-2 bg-yellow-900/30 border border-yellow-800/30 rounded">
                <div class="text-[10px] mb-1" :style="{ color: theme.chipYellowText }">Daha az zararlı:</div>
                <div class="text-[10px]">Olasılık: %80 × Etki: $5,000</div>
                <div class="text-xs mt-1 font-bold text-yellow-300">EMV = $4,000</div>
              </div>
            </div>
            <div class="mt-2 p-2 bg-green-900/20 border border-green-800/30 rounded text-[10px]">
              💡 <strong>Oyunda:</strong> Her risk kartında EMV gösterilir. Yüksek EMV'li risklere önce müdahale edin!
            </div>
          </div>

          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">EVM (Earned Value Management)</h3>
            <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div class="p-2 bg-black/40 rounded">
                <div class="font-bold text-blue-300">PV</div>
                <div>Planlanan Değer</div>
                <div class="mt-1 text-gray-400">Bu noktada ne kadar tamamlanmalıydı?</div>
              </div>
              <div class="p-2 bg-black/40 rounded">
                <div class="font-bold text-green-300">EV</div>
                <div>Kazanılan Değer</div>
                <div class="mt-1 text-gray-400">Gerçekte ne kadar tamamlandı?</div>
              </div>
              <div class="p-2 bg-black/40 rounded">
                <div class="font-bold text-red-300">AC</div>
                <div>Gerçek Maliyet</div>
                <div class="mt-1 text-gray-400">Ne kadar harcandı?</div>
              </div>
            </div>
            <div class="mt-2 text-[10px] flex flex-col gap-1">
              <div>• <strong>SV (Schedule Variance):</strong> EV - PV → Negatifse gecikmeli!</div>
              <div>• <strong>CV (Cost Variance):</strong> EV - AC → Negatifse bütçe aşımı!</div>
            </div>
          </div>

          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">Sinerji Bonus Formülü</h3>
            <p class="text-[10px]">Her sinerji çifti +8 ilerleme/gün sağlar. Doğru ekip kombinasyonu üstel verim yaratır.</p>
            <div class="mt-2 p-2 bg-black/40 rounded text-[10px]">
              <div class="mb-1 font-bold" :style="{ color: theme.chipYellowText }">Oyundaki Sinerji Çiftleri:</div>
              <div>🧑‍💻 Senior Dev + 🔍 QA → Kalite döngüsü</div>
              <div>🔧 DevOps + 🔒 Güvenlik → Altyapı kalesi</div>
              <div>📊 PM + tüm ekip → Koordinasyon çarpanı</div>
              <div>🎨 Frontend + 🤖 AI → Hız x2</div>
            </div>
          </div>
        </div>

        <!-- SÖZLÜK TAB -->
        <div v-if="activeTab === 'glossary'" class="flex flex-col gap-3">
          <div class="p-2 bg-black/20 rounded text-[10px]">
            📖 PMBOK® standardı terimlerinin Türkçe karşılıkları ve oyundaki yansımaları:
          </div>
          <div v-for="term in glossary" :key="term.en"
               class="p-3 bg-black/30 rounded border border-white/10 flex gap-3">
            <div class="text-lg flex-shrink-0">{{ term.icon }}</div>
            <div>
              <div class="flex gap-2 items-baseline flex-wrap mb-1">
                <span class="text-xs font-bold" :style="{ color: theme.chipYellowText }">{{ term.en }}</span>
                <span class="text-[10px]" :style="{ color: theme.chipGreenText }">→ {{ term.tr }}</span>
              </div>
              <div class="text-[10px] mb-1">{{ term.desc }}</div>
              <div v-if="term.game" class="text-[10px] px-2 py-1 rounded" style="background: rgba(0,100,200,0.15); border-left: 2px solid #4080c0;">
                🎮 {{ term.game }}
              </div>
            </div>
          </div>
        </div>

        <!-- GERÇEK DÜNYA TAB -->
        <div v-if="activeTab === 'realworld'" class="flex flex-col gap-4">
          <div class="p-2 bg-black/20 rounded text-[10px]">
            🌍 Gerçek dünyada yaşanmış, oyun mekaniklerinin referans aldığı PM vakaları:
          </div>
          <div v-for="case_ in realCases" :key="case_.title"
               class="p-3 bg-black/30 rounded border border-white/10">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ case_.icon }}</span>
              <div>
                <div class="text-xs font-bold" :style="{ color: theme.chipYellowText }">{{ case_.title }}</div>
                <div class="text-[10px]" style="color: #888;">{{ case_.company }} · {{ case_.year }}</div>
              </div>
            </div>
            <p class="text-[10px] mb-2">{{ case_.story }}</p>
            <div class="p-2 bg-red-900/20 border border-red-800/30 rounded text-[10px] mb-2">
              <strong style="color: #f08080;">Hata:</strong> {{ case_.mistake }}
            </div>
            <div class="p-2 bg-green-900/20 border border-green-800/30 rounded text-[10px] mb-2">
              <strong :style="{ color: theme.chipGreenText }">Ders:</strong> {{ case_.lesson }}
            </div>
            <div class="p-2 rounded text-[10px]" style="background: rgba(80,40,200,0.15); border-left: 2px solid #8060e0;">
              🎮 <strong>Oyundaki karşılığı:</strong> {{ case_.game }}
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ theme: Object })
const emit = defineEmits(['close'])

const tabs = [
  { id: 'basics',     name: '📘 TEMELLER' },
  { id: 'strategies', name: '🛡️ STRATEJİLER' },
  { id: 'metrics',    name: '📊 METRİKLER' },
  { id: 'glossary',   name: '📖 SÖZLÜK' },
  { id: 'realworld',  name: '🌍 GERÇEK DÜNYA' },
]
const activeTab = ref('basics')

const strategies = [
  {
    key: 'avoid', icon: '🛑', title: 'Kaçınma (Avoid)',
    color: '#f08080', cost: 'Oyun: $5,000',
    desc: 'Riski tamamen ortadan kaldırmak için proje planını değiştirmektir. Risk olasılığı ve etkisi sıfırlanır.',
    example: 'Güvenlik açığı bulunan üçüncü parti kütüphaneyi projeden çıkarmak.',
    game: 'Risk "resolved" durumuna geçer, artık tetiklenemez. En pahalı ama en güvenli.'
  },
  {
    key: 'mitigate', icon: '🛡️', title: 'Azaltma (Mitigate)',
    color: '#d8a830', cost: 'Oyun: $2,000',
    desc: 'Riskin olasılığını veya potansiyel etkisini kabul edilebilir bir seviyeye düşürür.',
    example: 'Bug riskine karşı QA uzmanı işe almak veya otomatik test eklemek.',
    game: 'Risk olasılığı yarıya iner. Hâlâ tetiklenebilir ama daha az olası.'
  },
  {
    key: 'transfer', icon: '📄', title: 'Aktarma (Transfer)',
    color: '#5890e0', cost: 'Oyun: $3,000',
    desc: 'Riskin finansal etkisini ve yönetim sorumluluğunu üçüncü bir tarafa devreder.',
    example: 'Sunucu çöküşü için sigorta yaptırmak veya DevOps\'u outsource etmek.',
    game: 'Risk gerçekleşse bile maliyet/moral hasarı sıfırlanır. Risk hâlâ yaşıyor.'
  },
  {
    key: 'accept', icon: '✅', title: 'Kabullenme (Accept)',
    color: '#907860', cost: 'Oyun: Ücretsiz',
    desc: 'Hiçbir proaktif aksiyon alınmaz. EMV düşük riskler için rasyonel bir karardır.',
    example: 'Düşük olasılıklı, düşük etkili bir riski bilerek görmezden gelmek.',
    game: 'Para harcanmaz ama risk "active" kalır ve tetiklenirse tam hasar alırsın.'
  },
]

const glossary = [
  { icon: '📋', en: 'Risk Register', tr: 'Risk Kaydı', desc: 'Tüm tanımlanmış risklerin, olasılıklarının, etkilerinin ve yanıt planlarının tutulduğu canlı belge.', game: 'Risk Merkezi\'ndeki tehdit listesi senin Risk Register\'ın.' },
  { icon: '🗺️', en: 'Risk Matrix', tr: 'Olasılık/Etki Matrisi', desc: 'Riskleri Yüksek/Orta/Düşük olarak kategorize eden 2 boyutlu ızgara. Nitel (qualitative) analiz aracı.', game: 'Risk kartlarındaki Kritik/Orta/Düşük renk kodları bu matristen gelir.' },
  { icon: '💰', en: 'Contingency Reserve', tr: 'Yedek Akçe', desc: 'Bilinen riskler için ayrılan, önceden onaylanmış bütçe tamponu. EMV toplamına göre belirlenir.', game: 'Başlangıç bütçen ($100k) içinde gizli yedek akçen var. İyi yönet!' },
  { icon: '📈', en: 'Scope Creep', tr: 'Kapsam Kayması', desc: 'Proje kapsamının resmi onay alınmadan yavaş yavaş genişlemesi. IT projelerinin #1 başarısızlık nedeni.', game: 'İkilem sistemi "Kapsam Kayması" vakası içerir. Reddet → baseline koru.' },
  { icon: '⏰', en: 'Crashing', tr: 'Hızlandırma', desc: 'Proje takvimini sıkıştırmak için ekstra maliyet (fazla mesai, kaynak) eklemektir. Süreyi kısaltır, maliyeti artırır.', game: 'Mesai açmak = Crashing. Hız artar ama moral ve enerji düşer.' },
  { icon: '📉', en: 'Technical Debt', tr: 'Teknik Borç', desc: 'Kısa vadeli hız kazancı için kod kalitesinden ödün vermek. Uzun vadede bakım maliyeti ve bug riski olarak geri döner.', game: '"Teknik Borç" risk kartı bug olasılığını artırır.' },
  { icon: '🎯', en: 'Baseline', tr: 'Temel Çizgi', desc: 'Onaylanmış proje planı (kapsam, takvim, bütçe). Değişiklikler bu çizgiye göre ölçülür.', game: '30 gün / $100k / 1000 effort senin baseline\'ın.' },
  { icon: '🔄', en: 'Lessons Learned', tr: 'Alınan Dersler', desc: 'Proje kapanışında (Closing) yapılan geriye dönük değerlendirme. Gelecek projelere girdi sağlar.', game: 'Oyun bitince gelen Post-Mortem ekranı senin Lessons Learned\'ın.' },
  { icon: '🤝', en: 'Stakeholder', tr: 'Paydaş', desc: 'Projeden etkilenen veya projeyi etkileyen herkes. Müşteri, ekip, yönetim, tedarikçiler vs.', game: 'Müşteri (scope creep ister), ekip (moral), yatırımcı (bütçe) oyundaki paydaşlarındır.' },
  { icon: '🔀', en: 'Change Control', tr: 'Değişiklik Kontrolü', desc: 'Proje kapsamına/takvimine yapılmak istenen değişikliklerin formal süreçten geçirilmesi.', game: 'İkilem\'de "Change Request İste" seçeneği = Change Control uygulamak.' },
]

const realCases = [
  {
    icon: '🚀', title: 'Mars İklim Uydu Felaketi',
    company: 'NASA / Lockheed Martin', year: '1999',
    story: '$327 milyon değerindeki uzay aracı, iki farklı ekibin birinin metrik (newton), diğerinin imperial (pound) birim kullandığını fark etmemesi yüzünden Mars atmosferinde yandı.',
    mistake: 'Entegrasyon riski tanımlanmadı. İki ekip arasında iletişim planı yoktu (Risk: "3. Parti Entegrasyon").',
    lesson: 'Proje Yönetimi\'nde "Varsayım Log\'u" (Assumption Log) kritiktir. Her ekip aynı birimi mi kullanıyor?',
    game: '"3. Parti Çöktü" ve "Güvenlik Açığı" riskleri benzer entegrasyon başarısızlıklarını simüle eder.'
  },
  {
    icon: '🏦', title: 'Knight Capital Flash Crash',
    company: 'Knight Capital Group', year: '2012',
    story: 'Bir yazılım güncellemesi sırasında eski bir algoritma yanlışlıkla production\'a deploy edildi. 45 dakikada $440 milyon kayıp yaşandı ve şirket iflasın eşiğine geldi.',
    mistake: 'Değişiklik kontrolü (Change Control) uygulanmadı. Rollback planı yoktu. Deployment riski "Accept" edilmişti.',
    lesson: '"Stajyer prod\'a push etti" senaryosu tam bu! CI/CD Pipeline ve Code Review yatırımı bu tür felaketleri önler.',
    game: '"Stajyer Hatası", "Kritik Bug" riskleri ve CI/CD + Code Review yükseltmeleri bu vakadan ilham aldı.'
  },
  {
    icon: '🏗️', title: 'Denver Havalimanı Bagaj Sistemi',
    company: 'Denver International Airport', year: '1995',
    story: 'Otomatik bagaj sistemi 2 yıl gecikmeli açıldı. Kapsam sürekli genişledi (Scope Creep), maliyetler $3.2 milyar aştı. Teknik borç birikimi sistemi çalışamaz hale getirdi.',
    mistake: 'Change Control süreci yoktu. Her "ufak" ek istek kabul edildi. Riski kimse Accept etmedi ama Transfer da etmedi.',
    lesson: 'Scope Creep\'e "Evet" demek zaman/maliyet üçgenini otomatik bozar. Formal Change Request zorunludur.',
    game: 'İkilem sistemi "Kapsam Kayması" vakası ve "Teknik Borç" riski bu senaryodan türetildi.'
  },
  {
    icon: '🎮', title: 'Cyberpunk 2077 Erken Çıkış',
    company: 'CD Projekt Red', year: '2020',
    story: 'Yönetim baskısı altında erken release kararı alındı. Ekip tükendi (Burnout), teknik borç birikti. Çıkış günü PlayStation Store\'dan kaldırıldı, $51M iade yapıldı.',
    mistake: 'Ekip moralini görmezden gelen Crashing uygulandı. Bug riski Transfer edilemedi ve Accept edilmedi, "görmezden gelindi".',
    lesson: 'Moralin düşmesi sadece hüzün değil, doğrudan kod kalitesini ve bug olasılığını artıran ölçülebilir bir risk faktörüdür.',
    game: 'Düşük moral → Bug Patlaması mekanik\'i tam bu ilişkiyi modeller. Morali yüksek tut!'
  },
]
</script>

<style scoped>
/* Scoped styles if necessary */
</style>
