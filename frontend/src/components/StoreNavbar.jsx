import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export function StoreNavbar() {
    const { cartCount, setIsCartOpen } = useCart();
    const { t } = useLanguage();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/store" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span>{t('brandName')}</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/store" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
                        {t('home')}
                    </Link>
                    <Link to="/store/products" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
                        {t('products')}
                    </Link>
                    <Link to="/store/tracking" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
                        {t('tracking')}
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeToggle />



                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}
