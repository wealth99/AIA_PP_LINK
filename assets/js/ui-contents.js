document.addEventListener("DOMContentLoaded", () => {
    // 로드 시 스크롤 스무스 적용(애니메이션 스크롤 이벤트때문에)
    document.body.style.scrollBehavior = 'smooth';

    initScrollSmoother();
    initComponents();
    updateHeaderStyle();
    removeInvalidPictureSources();
});

// 페이지가 로드시 최상단 복귀
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

let timer;
window.addEventListener('scroll', () => {
    if (!timer) {
        timer = setTimeout(() => {
        timer = null;
            updateHeaderStyle();
        }, 500);
    }
});

// '.bg-white' 클래스를 가진 요소 중 하나라도 화면 상단에 걸쳐 있는지 확인 - 'bg-white' 클래스를 토글(추가/제거)
const updateHeaderStyle = () => {
    const header = document.querySelector('header');
    const targets = document.querySelectorAll('[data-view-bg="white"]');

    const isAnyTargetVisible = Array.from(targets).some(target => {
        const rect = target.getBoundingClientRect();
        // 화면 상단을 지나가고 있으면서, 아직 화면에 일부가 남아있는지 확인
        return rect.top < 0 && rect.bottom > 0;
    });

    header.classList.toggle('bg-white', isAnyTargetVisible);
};

// 개발 환경에서 존재하지 않는 <picture>의 <source> 태그를 제거하여 404 에러를 방지합니다.
const removeInvalidPictureSources = () => {
    // 로컬 개발 환경이 아니면 함수를 종료합니다.
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
        return;
    }

    document.querySelectorAll('picture source').forEach(source => {
        const img = new Image();
        
        // 이미지 로드에 실패하면 해당 <source> 태그를 DOM에서 제거합니다.
        img.onerror = () => {
            source.remove();
        };
        
        // 이미지 로드를 시도합니다.
        img.src = source.srcset;
    });
};

// swiper.js 자동 스와이프 버튼 이벤트 리스너
const setSwiperAutoButton = swiper => {
    const swiperEl = swiper.el;
    const autoButton = swiperEl.querySelector('.swiper-autoplay');

    autoButton.addEventListener('click', () => {
        const isPressed = autoButton.getAttribute('aria-pressed') === 'false' ? true : false;
        
        if (!isPressed) { 
            autoButton.setAttribute('aria-pressed', 'false');
            swiper.autoplay.start();
        } else {
            autoButton.setAttribute('aria-pressed', 'true');
            swiper.autoplay.stop();
        }
    });
};

// swiper.js 옵션 및 초기화 연결
const setSwiperOptions = (customOptions = null) => {
    const ANI_TRANSITION_TIME = 400;
    const baseOptions = {
        speed: ANI_TRANSITION_TIME,
        keyboard: {
            enabled: true,
            onlyInViewport: false,
        },
        a11y: {
            enabled: true,
            containerMessage: "메인 슬라이드",
            containerRoleDescriptionMessage: "carousel",
            prevSlideMessage: "이전 슬라이드 이동",
            nextSlideMessage: "다음 슬라이드 이동",
            slideLabelMessage: "총 {{slidesLength}}장의 슬라이드 중 {{index}}번 슬라이드",
            firstSlideMessage: "첫번째 슬라이드",
            lastSlideMessage: "마지막 슬라이드",
            itemRoleDescriptionMessage: "slide",
            slideRole: "group",
            paginationBulletMessage: "{{index}}번째 슬라이드로 이동",
        },
        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    }

    return {
        ...baseOptions,
        ...customOptions
    };
};

// swiper.js 초기화
const initSwiper = (selector, options) => {
    const swiperEl = document.querySelector(selector);
    if (!swiperEl) {
        console.warn(`Swiper Elemnet not found: ${selector}`);
        return;
    }
    const slides = swiperEl.querySelectorAll('.swiper-slide');

    const slideCount = slides.length;
    const slidesPerView = options.slidesPerView || 1;
    const finalOptions = setSwiperOptions({ ...options });

    // 슬라이드 개수가 slidesPerView보다 작거나 같으면 loop를 비활성화
    if (slideCount <= slidesPerView) {
        finalOptions.loop = false;

        // 관련 컨트롤(버튼, 페이지네이션 등)을 찾아 숨김
        const container = swiperEl.closest('.swiper-container');
        if (container) {
            const control = container.querySelector('.swiper-control');
            control.style.display = 'none';
        }
    }
 
    return new Swiper(selector, finalOptions);
}

// gsap ScrollSmoother (사용 보류)
let smoother;
const initScrollSmoother = () => {
    smoother = ScrollSmoother.create({
        wrapper: '.smooth-wrapper',
        content: '.smooth-content',
        smooth: 1,
        effects: true,
        smoothTouch: 0.1,
    });
}

// 숫자 카운트 애니메이션
function animateCounter(options) {
    const { 
        element, 
        startValue, 
        targetValue, 
        duration = 1, 
        ease = 'none' 
    } = options;
    
    if (!element || startValue === undefined || targetValue === undefined) {
        console.error("animateCounter: 'element', 'startValue', 'targetValue'는 필수 옵션입니다.");
        return;
    }

    const counter = { value: startValue };
    
    element.textContent = Math.floor(startValue);

    gsap.to(counter, {
        value: targetValue,
        duration: duration,
        ease: ease,
        onUpdate: () => {
            element.textContent = Math.floor(counter.value);
        },
        onComplete: () => {
            element.textContent = targetValue;
        }
    });
}

// 컴포넌트(탭, 아코디언) 초기화
const initComponents = () => {
    // 탭 인스턴스 생성
    document.querySelectorAll('.tab-container').forEach(container => {
        container.tabsInstance = new Tab(container);
    });

    // 아코디언 인스턴스 생성
    document.querySelectorAll('.accordion').forEach(accordionEl => {
        new Accordion(accordionEl, { allowMultipleOpen: false });
    });
}

// 탭
class Tab {
    constructor(container) {
        this.container = container;
        this.tablist = container.querySelector(':scope > [role="tablist"]');

        const panelContainer = container.querySelector(':scope > .tab-panels');

        if (!this.tablist || !panelContainer) return;

        this.tabs = Array.from(this.tablist.querySelectorAll('[role="tab"]'));
        this.panels = Array.from(panelContainer.querySelectorAll(':scope > [role="tabpanel"]'));

        if (this.tabs.length === 0) return;

        this.init();
    }

    init() {
        this.tablist.addEventListener('click', this.handleClick.bind(this));
        this.tablist.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    handleClick(e) {
        const clickedTab = e.target.closest('[role="tab"]');
        if (clickedTab) {
            this.activateTab(clickedTab);
        }
    }

    handleKeydown(e) {
        const currentTab = e.target.closest('[role="tab"]');

        if (!currentTab) return;

        let newIndex = this.tabs.indexOf(currentTab);
        let shouldPreventDefault = true;

        switch (e.key) {
            case 'ArrowLeft':
                newIndex = (newIndex - 1 + this.tabs.length) % this.tabs.length;
                break;
            case 'ArrowRight':
                newIndex = (newIndex + 1) % this.tabs.length;
                break;
            case 'Home': newIndex = 0; break;
            case 'End': newIndex = this.tabs.length - 1; break;
            default: shouldPreventDefault = false; break;
        }

        if (shouldPreventDefault) {
            e.preventDefault();

            this.tabs[newIndex].focus();
            this.activateTab(this.tabs[newIndex]);
        }
    }

    activateTab(tabToActivate) {
        this.tabs.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });
        
        this.panels.forEach(panel => {
            panel.setAttribute('hidden', 'true');
        });

        const panelId = tabToActivate.getAttribute('aria-controls');
        const panelToActivate = this.container.querySelector(`#${panelId}`);

        tabToActivate.setAttribute('aria-selected', 'true');
        tabToActivate.setAttribute('tabindex', '0');
        
        if (panelToActivate) {
            panelToActivate.removeAttribute('hidden');
        }
    }

    openTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            const tabToActivate = this.tabs[index];
            this.activateTab(tabToActivate);
            tabToActivate.focus();
        } else {
            console.warn(`Tab index ${index} is out of bounds.`);
        }
    }
}

// 아코디언
class Accordion {
    constructor(accordionEl, options = {}) {
        this.accordionEl = accordionEl;
        this.buttons = Array.from(this.accordionEl.querySelectorAll('.accordion-button'));

        if (!this.accordionEl || this.buttons.length === 0) return;
        
        // 기본 옵션
        // 한 번에 하나의 패널만 열리게 하려면 allowMultipleOpen을 false로 설정하세요.
		// 여러 패널을 동시에 열려면 true로 설정하거나 options 객체를 제거하세요.
        const defaultOptions = {
            allowMultipleOpen: true 
        };

        this.options = { ...defaultOptions, ...options };

        this.init();
    }

    init() {
        this.accordionEl.querySelectorAll('.accordion-item').forEach(item => {
            const isActive = item.classList.contains('active');
            const button = item.querySelector('.accordion-button');
            const panel = item.querySelector('.accordion-panel');

            if (button) button.setAttribute('aria-expanded', isActive);
            if (panel) {
                panel.setAttribute('aria-hidden', !isActive);
                
                // 페이지 로드 시 열려있는 아코디언의 max-height 설정
                if (isActive) {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            }
        });

        this.buttons.forEach((button, index) => {
            button.addEventListener('click', (e) => this.handleClick(e));
            button.addEventListener('keydown', (e) => this.handleKeydown(e, index));
        });

        // 초기화가 끝난 후 transition을 활성화하여 페이지 로드 시 애니메이션 방지
        setTimeout(() => {
            this.accordionEl.classList.add('accordion--initialized');
        }, 1);
    }

    
    handleClick(e) {
        this.toggle(e.currentTarget);
    }

    handleKeydown(e, index) {
        switch (e.key) {
            case 'Enter':
            case ' ': // Space
                e.preventDefault();
                this.toggle(e.currentTarget);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.focusButton(index + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.focusButton(index - 1);
                break;
            case 'Home':
                e.preventDefault();
                this.focusButton(0);
                break;
            case 'End':
                e.preventDefault();
                this.focusButton(this.buttons.length - 1);
                break;
        }
    }

    focusButton(index) {
        const numButtons = this.buttons.length;
        const nextIndex = (index + numButtons) % numButtons;

        this.buttons[nextIndex].focus();
    }

    toggle(button) {
        const parentItem = button.closest('.accordion-item');
        if (!parentItem) return;

        const isOpening = !parentItem.classList.contains('active');
        const controlledPanel = document.getElementById(button.getAttribute('aria-controls'));

        // 한 번에 하나의 패널만 열리게 하는 경우, 다른 열린 패널을 닫기
        if (isOpening && !this.options.allowMultipleOpen) {
            this.accordionEl.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                const otherButton = activeItem.querySelector('.accordion-button');
                const otherPanel = activeItem.querySelector('.accordion-panel');

                activeItem.classList.remove('active');

                if(otherPanel) otherPanel.style.maxHeight = null;
                if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
                if (otherPanel) otherPanel.setAttribute('aria-hidden', 'true');
            });
        }

        parentItem.classList.toggle('active');
        button.setAttribute('aria-expanded', isOpening);

        if (controlledPanel) {
            controlledPanel.setAttribute('aria-hidden', !isOpening);

            if (isOpening) {
                controlledPanel.style.maxHeight = controlledPanel.scrollHeight + 'px';
            } else {
                controlledPanel.style.maxHeight = null;
            }
        }
    }
}