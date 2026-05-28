import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className }) {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <Globe className="w-4 h-4 text-gray-500" />
            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className={`bg-transparent text-sm font-bold border-none focus:ring-0 cursor-pointer p-1 inherit`}
                dir="ltr"
            >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
            </select>
        </div>
    );
}
