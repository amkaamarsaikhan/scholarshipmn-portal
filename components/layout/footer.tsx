import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & About */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-serif italic tracking-tighter">
              SCHOLARSHIP<span className="font-sans not-italic font-bold ml-1 text-emerald-400">MN</span>
            </Link>
            <p className="text-emerald-100/60 text-sm leading-relaxed font-light">
              Бид Монгол залууст дэлхийн шилдэг боловсролыг эзэмшихэд нь тусалж, баталгаат тэтгэлгийн мэдээллээр хангадаг.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-6">Цэсүүд</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><Link href="/scholarships" className="hover:text-emerald-400 transition-colors">Бүх тэтгэлэг</Link></li>
              <li><Link href="/countries" className="hover:text-emerald-400 transition-colors">Улс орнууд</Link></li>
              <li><Link href="/blog" className="hover:text-emerald-400 transition-colors">Зөвлөмжүүд</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Бидний тухай</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-6">Түгээмэл</h4>
            <ul className="space-y-4 text-sm font-light">
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Засгийн газрын тэтгэлэг</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Бакалаврын тэтгэлэг</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Магистрын тэтгэлэг</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Эссэ бичих зөвлөгөө</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-6">Холбоо барих</h4>
            <ul className="space-y-4 text-sm font-light text-emerald-100/70">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-400 shrink-0" />
                <span>Улаанбаатар хот, Сүхбаатар дүүрэг, 5-р хороо</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-400 shrink-0" />
                <span>+976 9919-8805</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-400 shrink-0" />
                <span>info@scholarshipmn.academy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-emerald-100/40">
          <p>© {new Date().getFullYear()} Scholarship MN. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-emerald-400">Үйлчилгээний нөхцөл</Link>
            <Link href="/privacy" className="hover:text-emerald-400">Нууцлалын бодлого</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;