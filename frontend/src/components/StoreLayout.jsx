import { StoreNavbar } from './StoreNavbar';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useEffect } from 'react';

export function StoreLayout({ children }) {
    const { settings } = useStoreSettings();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            localStorage.setItem('affiliateRef', refCode);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Announcement Bar */}
            {settings.announcement?.enabled && (
                <div
                    className="py-2 text-center text-sm font-bold px-4 animate-in slide-in-from-top"
                    style={{
                        backgroundColor: settings.announcement.color,
                        color: settings.announcement.textColor
                    }}
                >
                    {settings.announcement.text}
                </div>
            )}
            <StoreNavbar />
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t border-border py-8 bg-muted/30 mt-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    <div className="grid md:grid-cols-3 gap-8 mb-8 text-right">
                        <div>
                            <h3 className="font-bold text-foreground mb-4">ورشتي</h3>
                            <p>أجود الملابس المصنوعة بأيادي محترفة. جودة، أناقة، وإتقان.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground mb-4">روابط سريعة</h3>
                            <ul className="space-y-2">
                                <li><Link to="/store" className="hover:text-primary">الرئيسية</Link></li>
                                <li><Link to="/store/products" className="hover:text-primary">المنتجات</Link></li>
                                <li><Link to="/affiliates/register" className="hover:text-primary">كن مسوقاً معنا</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground mb-4">تواصل معنا</h3>
                            <p>هاتف: 0550000000</p>
                            <p>الجزائر العاصمة، الجزائر</p>
                        </div>
                    </div>
                    <p>&copy; {new Date().getFullYear()} ورشتي. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
}
