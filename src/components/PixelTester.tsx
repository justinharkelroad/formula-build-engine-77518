import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ANALYTICS_CONFIG } from '@/config/analytics';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const PixelTester = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fbqStatus, setFbqStatus] = useState<string>('');

  const checkFbqStatus = () => {
    if (typeof window !== 'undefined') {
      const status = window.fbq ? 'Defined ✅' : 'Undefined ❌';
      setFbqStatus(status);
      console.log(`[Pixel Tester] fbq status: ${status}`);
    }
  };

  const sendTestEvent = (eventName: string, params: any = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
      console.log(`[Pixel Tester] Sending ${eventName}:`, params);
      window.fbq('track', eventName, params);
    } else {
      console.warn(`[Pixel Tester] Cannot send ${eventName} - fbq not available`);
    }
  };

  const forceLoadPixel = () => {
    if (typeof window !== 'undefined' && !window.fbq) {
      console.log('[Pixel Tester] Force-loading Facebook Pixel...');
      
      // Inject the pixel script
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${ANALYTICS_CONFIG.FACEBOOK_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      
      setTimeout(() => checkFbqStatus(), 1000);
    } else {
      console.log('[Pixel Tester] Pixel already loaded');
    }
  };

  return (
    <div className="mt-16 border-t border-border pt-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Facebook Pixel Tester (Dev Tool)
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <Card className="bg-muted/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Facebook Pixel Debug Tool</CardTitle>
              <div className="text-sm text-muted-foreground">
                <div>Pixel ID: {ANALYTICS_CONFIG.FACEBOOK_PIXEL_ID}</div>
                <div>fbq Status: {fbqStatus || 'Click "Check Status" to verify'}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={checkFbqStatus}>
                  Check Status
                </Button>
                <Button size="sm" variant="outline" onClick={forceLoadPixel}>
                  Force-load Pixel
                </Button>
              </div>
              
              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">Test Events:</div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => sendTestEvent('PageView')}
                  >
                    Send PageView
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => sendTestEvent('InitiateCheckout', { value: 1, currency: 'USD' })}
                  >
                    InitiateCheckout ($1)
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => sendTestEvent('Purchase', { value: 1, currency: 'USD' })}
                  >
                    Purchase ($1)
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => sendTestEvent('Lead')}
                  >
                    Lead
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground border-t pt-3">
                💡 Check your browser&apos;s console for logs and Network tab for fbevents.js requests.
                Test events should appear in Facebook Events Manager &gt; Test Events.
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PixelTester;