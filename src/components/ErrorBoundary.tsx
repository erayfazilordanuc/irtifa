import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

// Uygulamanın en dış hata sınırı.
//
// Bir ekranda render hatası olduğunda React tüm ağacı söküyor ve kullanıcı boş
// bir ekranla kalıyordu — ne hata görünüyor ne de çıkış yolu vardı. Bu bileşen
// hatayı yakalayıp okunabilir bir ekran ve "tekrar dene" düğmesi gösteriyor.
//
// Tema bağlamına (ThemeProvider) bilerek bağlanmıyor: hata tam da o sağlayıcıdan
// geliyor olabilir. Renkler bu yüzden sabit ve iki temada da okunur seçildi.

type Props = { children: React.ReactNode };
type State = { error: Error | null; retried: boolean };

/**
 * Geçici (tek render'lık) hatalar. Bunlar bir sonraki render'da kendiliğinden
 * geçiyor; kullanıcıyı hata ekranına düşürmek yanlış olur.
 *
 * React Navigation'ın `NavigationStateContext` varsayılanı, getter'ları
 * okunduğu anda hata fırlatıyor. Tema değişimi gibi ağacın büyük kısmını aynı
 * anda yeniden render eden durumlarda navigator, container'ın değeri yerine bir
 * render boyunca bu varsayılanı görebiliyor. Sonraki render'da düzeliyor.
 */
const TRANSIENT_PATTERNS = [/Couldn't find a navigation context/i];

function isTransient(error: Error): boolean {
  const message = error?.message ?? String(error);
  return TRANSIENT_PATTERNS.some((pattern) => pattern.test(message));
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, retried: false };

  static getDerivedStateFromError(error: Error): State {
    return { error, retried: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Geçici hatada BİR kez sessizce yeniden dene. İkinci kez gelirse gerçek
    // bir hatadır ve ekran gösterilir — böylece sonsuz döngüye girilmiyor.
    if (isTransient(error) && !this.hasRetried) {
      this.hasRetried = true;
      console.warn('[ErrorBoundary] Geçici hata, yeniden deneniyor:', error.message);
      this.setState({ error: null, retried: true });
      return;
    }
    console.error('[ErrorBoundary] Ekran çizilemedi.', error, info.componentStack);
  }

  /** Tek seferlik yeniden deneme hakkı; state'ten ayrı tutuluyor ki render'ı etkilemesin. */
  private hasRetried = false;

  reset = () => {
    this.hasRetried = false;
    this.setState({ error: null, retried: false });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: '#0b1120', padding: 24, justifyContent: 'center' }}>
        <Text style={{ color: '#ffffff', fontSize: 19, fontWeight: '600', marginBottom: 10 }}>
          Bir şeyler ters gitti
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20, marginBottom: 18 }}>
          Bu ekran çizilirken beklenmeyen bir hata oluştu. Tekrar deneyebilir ya da uygulamayı
          kapatıp açabilirsiniz.
        </Text>

        <ScrollView
          style={{
            maxHeight: 180,
            backgroundColor: '#11182e',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#1d2946',
            padding: 14,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#cbd5e1', fontSize: 11, lineHeight: 17 }}>
            {error.message || String(error)}
          </Text>
        </ScrollView>

        <Pressable
          onPress={this.reset}
          accessibilityRole="button"
          style={{ backgroundColor: '#3b82f6', borderRadius: 14, paddingVertical: 15 }}
        >
          <Text
            style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', textAlign: 'center' }}
          >
            Tekrar dene
          </Text>
        </Pressable>
      </View>
    );
  }
}
