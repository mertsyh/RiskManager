<template>
  <div class="insight-backdrop" @click.self="$emit('close')">
    <div class="insight-panel modal-popin">

      <!-- Header -->
      <div class="insight-header">
        <span class="header-icon">🧠</span>
        <div>
          <div class="header-sub">GÜN {{ day }} · PM ANALİZİ</div>
          <div class="header-title">BUGÜNDEN NE ÖĞRENDİN?</div>
        </div>
      </div>

      <!-- Insights -->
      <div class="insights-list">
        <div v-for="(ins, i) in insights" :key="i" class="insight-card" :class="'insight-' + ins.type">
          <div class="insight-icon">{{ ins.icon }}</div>
          <div class="insight-body">
            <div class="insight-category">{{ ins.category }}</div>
            <div class="insight-term">{{ ins.term }}</div>
            <div class="insight-explanation">{{ ins.explanation }}</div>
            <div v-if="ins.gameNote" class="insight-gamenote">🎮 {{ ins.gameNote }}</div>
          </div>
        </div>

        <!-- Fallback -->
        <div v-if="!insights.length" class="insight-card insight-neutral">
          <div class="insight-icon">📋</div>
          <div class="insight-body">
            <div class="insight-category">PMBOK · TEMEL İLKE</div>
            <div class="insight-term">Demir Üçgen (Iron Triangle)</div>
            <div class="insight-explanation">Her proje Kapsam, Zaman ve Maliyet arasında bir denge kurar. Birini değiştirince diğerleri etkilenir. Sağlıklı proje yönetimi bu dengeyi korumaktır.</div>
            <div class="insight-gamenote">🎮 Deadline, bütçe ve moral — üçü birden yönetilebilirse proje başarılı olur.</div>
          </div>
        </div>
      </div>

      <button class="insight-close-btn" @click="$emit('close')">
        TAMAM, DEVAM ET ▶
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: { type: Object, required: true },
  day: { type: Number, default: 1 },
})
defineEmits(['close'])

const insights = computed(() => {
  const s = props.summary
  const result = []

  // ── Triggered Risk ──────────────────────────────────────
  if (s.triggeredRisk) {
    const r = s.triggeredRisk
    const typeMap = {
      server:   { category: 'PMBOK · RİSK TÜRLERİ', term: 'Teknik Risk (Technical Risk)', icon: '🔥',
        explanation: `"${r.name}" bir teknik/altyapı riskidir. Sunucu ve sistem riskleri genellikle Yüksek Etki / Orta Olasılık kategorisindedir. EMV = %${r.prob} × $${r.cost?.toLocaleString()} = $${Math.round(r.prob/100*(r.cost||0)).toLocaleString()} olarak hesaplanır.`,
        gameNote: 'Cloud Scaling yükseltmesi veya Transfer stratejisi bu riskin EMV\'sini düşürürdü.' },
      security: { category: 'PMBOK · GÜVENLİK RİSKİ', term: 'Güvenlik Açığı (Security Vulnerability)', icon: '🔓',
        explanation: `"${r.name}" bir siber güvenlik riskidir. Zero-day açıkları ve DDoS saldırıları projeye anlık büyük maliyet yüklemenin yanı sıra itibar kaybına da yol açar.`,
        gameNote: 'Eve (Güvenlik) + Bob (DevOps) sinerji çifti bu tür risklerin olasılığını düşürür.' },
      bug:      { category: 'PMBOK · KALİTE YÖNETİMİ', term: 'Hata Maliyeti (Cost of Poor Quality)', icon: '🐛',
        explanation: `"${r.name}" bir yazılım kalite riskidir. PMBOK\'a göre hataları production sonrası düzeltmek, geliştirme aşamasında önlemenin 10 katı maliyetlidir (Prevention > Inspection).`,
        gameNote: 'Code Review yükseltmesi ve QA (Charlie) işe alımı bug riskini mitigate eder.' },
      api:      { category: 'PMBOK · TEDARİK YÖNETİMİ', term: '3. Parti Bağımlılık Riski', icon: '🔌',
        explanation: `"${r.name}" harici servis bağımlılığından kaynaklanan bir tedarik riskidir. Tek tedarikçiye bağımlılık (Single Point of Failure) kritik bir zayıflıktır.`,
        gameNote: 'Transfer stratejisi ile 3. parti riskleri sigortalanabilir ya da yedek tedarikçi (fallback) planlanabilir.' },
      scope:    { category: 'PMBOK · KAPSAM YÖNETİMİ', term: 'Kapsam Kayması (Scope Creep)', icon: '📈',
        explanation: `"${r.name}" kapsam yönetim riskidir. Onaysız kapsam değişiklikleri hem takvimi hem bütçeyi zorlar. Change Control Board (CCB) bu riskleri filtreler.`,
        gameNote: 'Scope Creep ikilemine "Reddet" demek baseline\'ı korur ve bu tür risklerin olasılığını düşürür.' },
      conflict: { category: 'PMBOK · İNSAN KAYNAKLARI', term: 'Takım Dinamiği Riski (Team Conflict)', icon: '⚡',
        explanation: `"${r.name}" insan kaynakları riskidir. Takım içi çatışma verimlilik kaybına ve moral düşüşüne yol açar. PM\'in çatışma yönetimi (Conflict Resolution) yetkinliği kritiktir.`,
        gameNote: 'Diana (PM) işe alımı takım koordinasyonunu artırır ve çatışma riskini mitigate eder.' },
    }
    const info = typeMap[r.type] || { category: 'PMBOK · RİSK', term: r.name, icon: '⚠️', explanation: 'Beklenmedik bir risk tetiklendi. Risk yönetiminde hiçbir risk %100 önlenemez, bu yüzden Contingency Reserve (Yedek Akçe) tutmak kritiktir.', gameNote: '' }
    result.push({ type: 'danger', ...info })
  }

  // ── Bug Event (low morale) ───────────────────────────────
  if (s.bugEvent) {
    result.push({
      type: 'warning', icon: '😰',
      category: 'PMBOK · İNSAN KAYNAKLARI',
      term: 'Tükenmişlik Sendromu (Burnout) → Kalite Düşüşü',
      explanation: 'Moral %40\'ın altına düştüğünde ekip hata yapma olasılığı dramatik biçimde artar. PMBOK, çalışan refahını (Team Well-being) ölçülebilir bir proje riski olarak değerlendirir.',
      gameNote: `Bugün düşük moral (${s.morale}%) bug patlamasına neden oldu ve ilerleme kaybedildi. Espresso, Ergonomik Masa veya Diana (PM) yatırımı morali yüksek tutar.`,
    })
  }

  // ── Critical Success ─────────────────────────────────────
  if (s.critSuccess) {
    result.push({
      type: 'success', icon: '⭐',
      category: 'PMBOK · POZİTİF RİSK',
      term: 'Fırsatı Değerlendirme (Exploit Strategy)',
      explanation: 'Risk sadece tehdit değil, fırsattır. PMBOK\'a göre pozitif risklere (Opportunities) "Exploit" stratejisi uygulanır: Fırsatın kesin gerçekleşmesi için kaynak tahsis edilir. Yüksek moral tam olarak bu fırsatı yaratır.',
      gameNote: `Ekip morali (${s.morale}%) kritik başarı eşiğini geçti ve ilerleme 2x oldu! Morali %70 üzerinde tutmak bu fırsatı tekrar yaratır.`,
    })
  }

  // ── Synergy Bonus ────────────────────────────────────────
  if (s.synergyBonus > 0) {
    result.push({
      type: 'info', icon: '🤝',
      category: 'PMBOK · KAYNAK YÖNETİMİ',
      term: 'Ekip Sinerjisi (Team Synergy)',
      explanation: 'Sinerji, ekibin birlikte ürettiği değerin bireysel katkıların toplamını aşmasıdır. Doğru roller arası kombinasyon (örn: QA + Senior Dev) hem kaliteyi hem hızı artırır. Bu matematiksel bir gerçektir.',
      gameNote: `Bugün sinerji bonusu +${s.synergyBonus} ilerleme sağladı. Her yeni sinerji çifti günlük +8 puan ekler.`,
    })
  }

  // ── Low Morale Warning ───────────────────────────────────
  if (!s.bugEvent && s.morale < 35) {
    result.push({
      type: 'warning', icon: '😰',
      category: 'PMBOK · RİSK KONTROLÜ',
      term: 'Erken Uyarı Göstergesi (Early Warning Indicator)',
      explanation: `Moral şu an ${s.morale}% — kritik eşiğin altında. PMBOK izleme sürecinde bu tür göstergeler "kırmızı bayrak" (red flag) olarak değerlendirilir ve proaktif müdahale gerektirir.`,
      gameNote: 'Moral düşüklüğü → Bug riski artar, verim düşer, kritik başarı şansı kaybolur. Standup, Espresso veya Frank (Frontend) moral verir.',
    })
  }

  // ── Budget Warning ───────────────────────────────────────
  if (s.cost > 0 && !s.triggeredRisk) {
    // Only show if money context is educational — don't flood with tips
    // Show "burn rate" concept if we haven't filled with other tips
    if (result.length === 0) {
      result.push({
        type: 'info', icon: '💰',
        category: 'PMBOK · MALİYET YÖNETİMİ',
        term: 'Günlük Yakma Oranı (Daily Burn Rate)',
        explanation: `Bugün $${s.cost.toLocaleString()} personel maliyeti harcandı. Proje boyunca sürekli akan bu maliyete "burn rate" denir. Kalan bütçe ÷ burn rate = kaç gün daha çalışılabilir sorusunun yanıtıdır.`,
        gameNote: 'Bütçe tükenirse oyun biter. İşe aldığın her çalışanın günlük maliyetini süre ile çarp ve toplam personel bütçeni hesapla.',
      })
    }
  }

  // ── NEW: Reserve Usage ───────────────────────────────────
  if (s.usedReserve) {
    result.push({
      type: 'info', icon: '🛡️',
      category: 'PMBOK · MALİYET YÖNETİMİ',
      term: 'Yedek Akçe (Contingency Reserve)',
      explanation: 'Contingency Reserve, bilinen riskler (known-unknowns) için ayrılır ve proje yöneticisinin kontrolündedir. Management Reserve ise bilinmeyen riskler (unknown-unknowns) içindir ve sponsor kontrolündedir.',
      gameNote: 'Bugün bir risk tetiklendi ve hasar ana bütçe yerine Contingency Reserve\'den karşılandı. Bu, proaktif bütçelemenin (Risk Response Planning) sonucudur.',
    })
  }

  // ── NEW: High Risk Count ─────────────────────────────────
  if (s.activeRiskCount >= 3 && !s.triggeredRisk) {
    result.push({
      type: 'warning', icon: '📋',
      category: 'PMBOK · RİSK İZLEME',
      term: 'Risk Register Şişkinliği',
      explanation: 'Risk Register\'da (Risk Kayıt Defteri) çok sayıda açık risk birikmesi, risk yanıt planlarının (Risk Response) zamanında uygulanmadığı anlamına gelebilir.',
      gameNote: `Şu an ${s.activeRiskCount} adet açık risk var. Risk Merkezi'ni açıp bazılarını Mitigate, Avoid veya Transfer etmelisin, aksi takdirde peş peşe tetiklenebilirler.`,
    })
  }

  // ── NEW: Zero Synergy ────────────────────────────────────
  if (s.synergyBonus === 0 && s.day > 5) {
    result.push({
      type: 'neutral', icon: '🧩',
      category: 'PMBOK · İNSAN KAYNAKLARI',
      term: 'Takım Oluşturma (Team Building)',
      explanation: 'Tuckman\'ın takım gelişim modeline göre (Forming, Storming, Norming, Performing), doğru yetkinliklerin bir araya gelmesi performansı üstel artırır.',
      gameNote: 'Şu an sıfır sinerji bonusun var. İşe alım yaparken çalışanların açıklamalarındaki "X ile sinerji" notlarına dikkat et. Örn: Alice + Charlie.',
    })
  }

  // ── NEW: Schedule Variance (SV) ──────────────────────────
  if (s.day >= 15 && (s.totalProgress / s.totalEffort) < 0.40) {
    result.push({
      type: 'danger', icon: '⏳',
      category: 'PMBOK · ZAMAN YÖNETİMİ',
      term: 'Schedule Variance (SV) Negatif!',
      explanation: 'Kazanılan Değer (EV) < Planlanan Değer (PV) durumu. Projenin takvimin çok gerisinde olduğunu ve gecikme riski taşıdığını gösterir.',
      gameNote: 'Sürenin yarısı geçti ama işin %40\'ı bile bitmedi. Crashing (mesai) veya Fast Tracking kararları alman ya da yeni eleman alman gerekebilir.',
    })
  }

  // ── NEW: Cost Performance Index (CPI) ────────────────────
  if (s.money < 30000 && s.day < 20) {
    result.push({
      type: 'danger', icon: '💸',
      category: 'PMBOK · MALİYET YÖNETİMİ',
      term: 'CPI (Cost Performance Index) Uyarısı',
      explanation: 'CPI < 1.0 olması, projede harcanan paraya kıyasla üretilen değerin düşük olduğunu gösterir. Bütçe aşımı (Cost Overrun) riski çok yüksektir.',
      gameNote: 'Nakit $30k altına düştü. Kalan günlerdeki personel giderlerini hesapla. Gerekirse pahalı ama az verimli çalışanları işten çıkar (Fire).',
    })
  }

  // ── NEW: No Upgrades ─────────────────────────────────────
  if (!s.hasAnyUpgrade && s.day >= 7) {
    result.push({
      type: 'info', icon: '⚙️',
      category: 'PMBOK · KALİTE YÖNETİMİ',
      term: 'Önleyici Faaliyet (Preventive Action)',
      explanation: 'Önleyici faaliyetler, gelecekteki proje performansının proje yönetim planıyla hizalanmasını sağlamak için yapılan proaktif yatırımlardır.',
      gameNote: '7. güne geldin ama hiç Yükseltme (Upgrade) almadın. CI/CD Pipeline veya Code Review gibi yatırımlar uzun vadede hem hız kazandırır hem hata riskini (Defect) azaltır.',
    })
  }

  return result.slice(0, 3) // Max 3 insight göster
})
</script>

<style scoped>
.insight-backdrop {
  position: fixed; inset: 0; z-index: 45;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  background: rgba(0,0,0,0.72);
}

.insight-panel {
  width: 660px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #1a1008;
  border: 4px solid #3a2810;
  box-shadow: inset 2px 2px 0 #2a1e0c, inset -2px -2px 0 #0e0804, 6px 6px 0 #06030a;
}

.modal-popin { animation: popin 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popin { 0%{transform:scale(0.7) translateY(16px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }

.insight-header {
  background: #0e1830;
  border-bottom: 3px solid #1a2c50;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.header-icon { font-size: 32px; }
.header-sub {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #5080c0; letter-spacing: 3px; margin-bottom: 7px;
}
.header-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px; color: #80b0f0;
}

.insights-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
}

.insight-card {
  display: flex;
  gap: 14px;
  padding: 14px;
  border: 2px solid;
}
.insight-danger  { background: #200808; border-color: #501010; }
.insight-warning { background: #201008; border-color: #503010; }
.insight-success { background: #081808; border-color: #105010; }
.insight-info    { background: #081020; border-color: #103050; }
.insight-neutral { background: #141008; border-color: #302818; }

.insight-icon { font-size: 28px; flex-shrink: 0; line-height: 1; padding-top: 2px; }

.insight-body { display: flex; flex-direction: column; gap: 5px; }

.insight-category {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; letter-spacing: 2px;
}
.insight-danger  .insight-category { color: #c06060; }
.insight-warning .insight-category { color: #c09040; }
.insight-success .insight-category { color: #60c060; }
.insight-info    .insight-category { color: #6090c0; }
.insight-neutral .insight-category { color: #907860; }

.insight-term {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px; line-height: 1.8;
}
.insight-danger  .insight-term { color: #f08080; }
.insight-warning .insight-term { color: #f0a060; }
.insight-success .insight-term { color: #80e080; }
.insight-info    .insight-term { color: #80b0f0; }
.insight-neutral .insight-term { color: #c0a878; }

.insight-explanation {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #a09080; line-height: 2.4;
}

.insight-gamenote {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #508070;
  background: rgba(0,80,60,0.2);
  border-left: 3px solid #206050;
  padding: 8px 12px;
  line-height: 2.4;
}

.insight-close-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 22px;
  width: 100%;
  background: #1c4010;
  color: #80d050;
  border: none;
  border-top: 3px solid #0e2008;
  cursor: pointer;
  transition: background 0.1s, transform 0.1s;
  flex-shrink: 0;
  letter-spacing: 2px;
}
.insight-close-btn:hover  { background: #2a5818; }
.insight-close-btn:active { transform: translateY(2px); }
</style>
