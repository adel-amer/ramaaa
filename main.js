// Page interactivity
document.addEventListener('DOMContentLoaded', () => {
    const WA_NUMBER = '966505635240';

    // Year
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    const scrolledClasses = ['bg-darkslate-dark/95', 'shadow-xl', 'backdrop-blur-md'];
    const applyNav = () => scrolledClasses.forEach(c => navbar.classList.toggle(c, window.scrollY > 50));
    window.addEventListener('scroll', applyNav, { passive: true });
    applyNav();

    // Mobile menu (aria-aware, closes on link click / Escape)
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const setMenu = open => {
        menu.classList.toggle('hidden', !open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
        btn.querySelector('i').className = open ? 'fa-solid fa-xmark text-2xl' : 'fa-solid fa-bars text-2xl';
    };
    btn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // Highlight the current page in the nav
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a, #mobile-menu a').forEach(a => {
        const file = a.getAttribute('href').split('#')[0];
        if (file === page && !(page === 'contact.html' && a.getAttribute('href').includes('#contact-info') && location.hash !== '#contact-info')) {
            a.classList.add('is-active');
        }
    });

    // Hero stats count up once
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('#hero .grid-cols-3 > div > span:first-child').forEach(el => {
        const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
        if (!m || reduce) return;
        const [, pre, num, post] = m, end = +num, t0 = performance.now() + 500, dur = 1400;
        el.textContent = pre + '0' + post;
        const tick = now => {
            const p = Math.min(Math.max((now - t0) / dur, 0), 1);
            el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + post;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    // Portfolio filter
    const filterBtns = document.querySelectorAll('#portfolio-filters button');
    const items = document.querySelectorAll('.portfolio-item');
    const on = ['bg-gold', 'text-darkslate', 'font-bold'];
    const off = ['bg-darkslate-light', 'text-gray-300', 'border', 'border-gray-700'];
    filterBtns.forEach(b => {
        b.setAttribute('aria-pressed', String(b.classList.contains('bg-gold')));
        b.addEventListener('click', () => {
            filterBtns.forEach(x => {
                x.classList.remove(...on); x.classList.add(...off);
                x.setAttribute('aria-pressed', 'false');
            });
            b.classList.add(...on); b.classList.remove(...off);
            b.setAttribute('aria-pressed', 'true');
            const f = b.dataset.filter;
            items.forEach(it => it.classList.add('is-fading'));
            setTimeout(() => {
                items.forEach(it => {
                    it.classList.toggle('is-hidden', !(f === 'all' || it.classList.contains(f)));
                    requestAnimationFrame(() => it.classList.remove('is-fading'));
                });
            }, reduce ? 0 : 250);
        });
    });

    // Modal Gallery Lightbox Logic
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalCategory = document.getElementById('modal-category');
        const modalCounter = document.getElementById('modal-counter');
        const modalThumbnails = document.getElementById('modal-thumbnails');
        const closeBtn = document.getElementById('modal-close');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        let currentImages = [];
        let currentIndex = 0;

        const updateModal = (index) => {
            currentIndex = index;
            modalImg.src = currentImages[currentIndex];
            modalCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
            
            const thumbs = modalThumbnails.querySelectorAll('img');
            thumbs.forEach((t, i) => {
                t.classList.toggle('border-gold', i === currentIndex);
                t.classList.toggle('opacity-100', i === currentIndex);
                t.classList.toggle('opacity-50', i !== currentIndex);
            });
        };

        const openModal = (item) => {
            try {
                currentImages = JSON.parse(item.dataset.gallery || '[]');
            } catch(e) {
                currentImages = [item.querySelector('img').src];
            }
            if (!currentImages.length) return;

            modalTitle.textContent = item.dataset.title || '';
            modalCategory.textContent = item.dataset.category || '';
            
            modalThumbnails.innerHTML = '';
            currentImages.forEach((src, idx) => {
                const thumb = document.createElement('img');
                thumb.src = src;
                thumb.className = 'w-12 h-12 object-cover rounded-lg cursor-pointer border-2 border-transparent transition-all opacity-50 hover:opacity-100';
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateModal(idx);
                });
                modalThumbnails.appendChild(thumb);
            });

            updateModal(0);
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };

        items.forEach(item => {
            item.addEventListener('click', () => openModal(item));
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateModal((currentIndex - 1 + currentImages.length) % currentImages.length);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateModal((currentIndex + 1) % currentImages.length);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') updateModal((currentIndex - 1 + currentImages.length) % currentImages.length);
            if (e.key === 'ArrowLeft') updateModal((currentIndex + 1) % currentImages.length);
        });
    }

    // Toast
    const toast = document.createElement('div');
    toast.id = 'toast'; toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    let toastTimer;
    const showToast = msg => {
        toast.textContent = msg; toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
    };

    // Forms: validate, then send the request to WhatsApp (no backend needed)
    const phoneOk = v => /^(\+?966|00966|0)?5\d{8}$/.test(v.replace(/[\s-]/g, ''));
    const setError = (input, msg) => {
        input.classList.add('field-error');
        input.setAttribute('aria-invalid', 'true');
        const e = document.createElement('p');
        e.className = 'field-error-msg'; e.textContent = msg;
        input.parentNode.appendChild(e);
    };
    const clearErrors = form => {
        form.querySelectorAll('.field-error-msg').forEach(e => e.remove());
        form.querySelectorAll('.field-error').forEach(i => {
            i.classList.remove('field-error'); i.removeAttribute('aria-invalid');
        });
    };
    const selText = s => s ? s.options[s.selectedIndex].text : '';

    const handle = (form, build, after) => {
        if (!form) return;
        form.addEventListener('submit', e => {
            e.preventDefault();
            clearErrors(form);
            const name = form.querySelector('input[type="text"]');
            const phone = form.querySelector('input[type="tel"]');
            let ok = true;
            if (name.value.trim().length < 2) { setError(name, 'اكتب اسمك الكامل'); ok = false; }
            if (!phoneOk(phone.value)) { setError(phone, 'اكتب رقم جوال سعودي صحيح، مثال: 0505635240'); ok = false; }
            if (!ok) { form.querySelector('.field-error').focus(); return; }
            const text = encodeURIComponent(build(form, name.value.trim(), phone.value.trim()));
            window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank', 'noopener');
            form.reset();
            after();
        });
    };

    handle(document.getElementById('quick-form'),
        (f, n, p) => `طلب كشف وتثمين\nالاسم: ${n}\nالجوال: ${p}\nالخدمة: ${selText(f.querySelector('select'))}`,
        () => showToast('تم تجهيز طلبك. أكمل الإرسال من واتساب وسنرد عليك قريباً.'));

    handle(document.getElementById('lead-form'),
        (f, n, p) => [
            'طلب استشارة وتسعير',
            `الاسم: ${n}`, `الجوال: ${p}`,
            `الخدمة: ${selText(f.querySelector('#property-type'))}`,
            `المساحة: ${f.querySelector('#space-area').value || '-'} م²`,
            `الميزانية: ${selText(f.querySelector('#budget'))}`,
            `التفاصيل: ${f.querySelector('#message').value.trim() || '-'}`
        ].join('\n'),
        () => {
            const ok = document.getElementById('success-message');
            ok.classList.remove('hidden');
            setTimeout(() => ok.classList.add('hidden'), 6000);
        });
});