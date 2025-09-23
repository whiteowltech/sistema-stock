import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LOGO_BASE64 } from './logo-base64';

type Producto = { nombre: string; cantidad: number | string; precio: number | string };
type RemitoData = { fecha?: string | Date; cliente?: string; productos?: Producto[] };

@Component({
    selector: 'app-remito-pdf',
    standalone: true,
    imports: [FormsModule],
    template: `
            <span class="remito-pdf">
                <input type="text" [(ngModel)]="clienteManual" placeholder="Cliente..." style="width:120px; margin-right:4px;" />
                <svg (click)="generateRemito()" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="cursor:pointer;vertical-align:middle;fill:#d32f2f">
                    <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm6 1.5L18.5 8H14a2 2 0 0 1-2-2zm-6 17V4h7v5a2 2 0 0 0 2 2h5v10z"/>
                    <text x="6" y="20" font-size="7" fill="#fff">PDF</text>
                </svg>
            </span>
        `
})
export class RemitoPdfComponent implements OnInit {
    @Input() remitoData: RemitoData = { productos: [] };

        private logoBase64: string | null = null;
        clienteManual: string = '';

    constructor() { }

    ngOnInit() {
        // Lee el archivo que contiene el base64 del logo
        this.logoBase64 = LOGO_BASE64;
    }
        async generateRemito() {
            try {
                const pdfMakeModule = await import('pdfmake/build/pdfmake');
                const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

                const pdfMake: any = (pdfMakeModule as any).default || pdfMakeModule;
                const pdfFonts: any = (pdfFontsModule as any).default || pdfFontsModule;
                pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

                const productos = this.remitoData?.productos ?? [];
                const filas = productos.map(p => {
                    const cantidad = Number(p.cantidad || 0);
                    const precio = Number(p.precio || 0);
                    return [
                        String(p.nombre ?? ''),
                        isFinite(cantidad) ? cantidad : 0,
                        isFinite(precio) ? precio.toFixed(2) : '0.00',
                        isFinite(cantidad * precio) ? (cantidad * precio).toFixed(2) : '0.00'
                    ];
                });

                const total = productos.reduce((sum, p) => {
                    const c = Number(p.cantidad || 0);
                    const pr = Number(p.precio || 0);
                    return sum + (isFinite(c * pr) ? c * pr : 0);
                }, 0);

                // ✅ Fecha y hora formateadas
                const fechaFormateada = this.remitoData?.fecha
                    ? new Date(this.remitoData.fecha).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    : '';

                // Usa el cliente manual si está definido
                const clienteFinal = this.clienteManual?.trim() ? this.clienteManual.trim() : (this.remitoData?.cliente ?? '');

                const docDefinition = {
                    background: this.logoBase64
                        ? {
                                image: this.logoBase64,
                                width: 400,
                                opacity: 0.1,
                                alignment: 'center',
                                margin: [0, 200, 0, 0] // ajustá posición vertical
                            }
                        : undefined,
                    content: [
                        {
                            columns: [
                                this.logoBase64
                                    ? { image: this.logoBase64, width: 80, alignment: 'left' }
                                    : {},
                                { text: 'Remito', style: 'header', alignment: 'right' }
                            ]
                        },
                        { text: `Fecha: ${fechaFormateada}`, margin: [0, 10, 0, 0] },
                        { text: `Cliente: ${clienteFinal}` },
                        { text: ' ' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto', 'auto', 'auto'],
                                body: [
                                    ['Producto', 'Cantidad', 'Precio unitario', 'Subtotal'],
                                    ...filas,
                                    [
                                        { text: 'TOTAL', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                                        { text: total.toFixed(2), bold: true }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines'
                        },
                        { text: ' ' },
                        { text: 'Firma: ______________________', margin: [0, 30, 0, 0] }
                    ],
                    styles: {
                        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
                    },
                    defaultStyle: {
                        fontSize: 10
                    },
                    pageMargins: [40, 40, 40, 40]
                };

                pdfMake.createPdf(docDefinition).download('remito.pdf');
            } catch (err) {
                console.error('Error generando PDF:', err);
                alert('No se pudo generar el PDF. Revisá la consola para más detalles.');
            }
        }
}
