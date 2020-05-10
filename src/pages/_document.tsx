import React, { ReactElement } from 'react'
import Document, { Head, Main, NextScript } from 'next/document'

export default class extends Document {
  render(): ReactElement {
    return (
      <html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            (function(f, a, t, h, o, m){
            a[h]=a[h]||function(){
            (a[h].q=a[h].q||[]).push(arguments)
            };
            o=f.createElement('script'),
            m=f.getElementsByTagName('script')[0];
            o.async=1; o.src=t; o.id='fathom-script';
            m.parentNode.insertBefore(o,m)
            })(document, window, 'https://cdn.usefathom.com/tracker.js', 'fathom');
            fathom('set', 'siteId', 'QFZGKZMZ');
            fathom('trackPageview');
          `,
            }}
          />
        </body>
      </html>
    )
  }
}
