/* app.js - Shotcut Tutorial Interactivity */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWorkspaceInteraction();
  initTutorialTabs();
  initShortcutFilter();
  initScrollObserver();
  initLightbox();
  initFilterMediaControls();
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve saved theme or check system preferences
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else {
    htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* ==========================================================================
   2. Interactive Workspace Mockup Map
   ========================================================================== */
const WORKSPACE_DATA = {
  playlist: {
    icon: 'fa-list-ul',
    title: '播放清單與濾鏡面板',
    subtitle: '左側主要面板區',
    html: `
      <p>這是您集中管理影片素材與設定特效的地方。它包含了三個核心標籤：</p>
      <ul class="detail-bullets">
        <li><strong>播放清單 (Playlist)：</strong>將電腦中的影片、圖片、音效拖曳到此處進行預備，以便拉入時間軸。</li>
        <li><strong>濾鏡面板 (Filters)：</strong>選取時間軸上的片段後，在此處按「+」可新增如裁剪、淡入淡出、文字、調色等效果。</li>
        <li><strong>屬性面板 (Properties)：</strong>顯示目前素材的詳細規格，包含解析度、長度、速度、解碼率等。</li>
      </ul>
    `
  },
  player: {
    icon: 'fa-play',
    title: '預覽播放器 (Player)',
    subtitle: '中央即時畫面監視器',
    html: `
      <p>用來即時檢視剪輯畫面與播放效果，支援兩種檢視模式：</p>
      <ul class="detail-bullets">
        <li><strong>來源 (Source) 模式：</strong>單獨預覽播放清單中選取的單個原始素材，供您決定要剪下的長度。</li>
        <li><strong>專案 (Project) 模式：</strong>播放目前整條時間軸上的合成效果與所有剪輯好的段落。</li>
        <li><strong>播放控制：</strong>除了標準的播放與暫停外，使用左右方向鍵可以進行「逐影格 (Frame-by-Frame)」的精細前後移動。</li>
      </ul>
    `
  },
  timeline: {
    icon: 'fa-rectangle-list',
    title: '多軌時間軸 (Timeline)',
    subtitle: '底部主要編輯核心區',
    html: `
      <p>這是您進行影片重組、分割、混音的核心工作區：</p>
      <ul class="detail-bullets">
        <li><strong>軌道架構：</strong>可自由新增多條「視訊軌道」（堆疊子母畫面、字卡、浮水印）與「音訊軌道」（背景配樂、音效、旁白）。</li>
        <li><strong>分割剪開 (S)：</strong>在時間線上按下 S 鍵即可切斷影片。</li>
        <li><strong>磁鐵吸附功能：</strong>開啟吸附後，片段靠近時會自動無縫貼合，有效防止兩段影片間產生黑色間隔。</li>
        <li><strong>重疊轉場：</strong>將前後片段在同軌道上重疊，會自動產生交叉淡化 (Crossfade) 轉場特效。</li>
      </ul>
    `
  }
};

function initWorkspaceInteraction() {
  const zones = document.querySelectorAll('.workspace-zone');
  const detailIcon = document.getElementById('detail-icon');
  const detailTitle = document.getElementById('detail-title');
  const detailContent = document.getElementById('detail-content');

  zones.forEach(zone => {
    zone.addEventListener('click', () => {
      // Remove active from all
      zones.forEach(z => z.classList.remove('active'));
      
      // Add active to current
      zone.classList.add('active');
      
      // Update details
      const zoneName = zone.getAttribute('data-zone');
      const data = WORKSPACE_DATA[zoneName];
      
      if (data) {
        // Smooth transition effect
        detailContent.style.opacity = '0';
        detailTitle.style.opacity = '0';
        detailIcon.style.opacity = '0';

        setTimeout(() => {
          detailIcon.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
          detailTitle.innerHTML = `${data.title} <br><small style="color: var(--text-muted); font-size: 0.8rem; font-weight: normal;">${data.subtitle}</small>`;
          detailContent.innerHTML = data.html;
          
          detailIcon.style.opacity = '1';
          detailTitle.style.opacity = '1';
          detailContent.style.opacity = '1';
        }, 150);
      }
    });
  });
}

/* ==========================================================================
   3. Step-by-Step Tutorial Tab Switching
   ========================================================================== */
function initTutorialTabs() {
  const tabButtons = document.querySelectorAll('.tutorial-tab-btn');
  const contentPanes = document.querySelectorAll('.tutorial-content-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      // Remove active class from buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      // Add active to current button
      btn.classList.add('active');

      // Hide all panes
      contentPanes.forEach(pane => {
        pane.classList.remove('active');
      });

      // Show and animate target pane
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. Keyboard Shortcut Filter and Search Engine
   ========================================================================== */
function initShortcutFilter() {
  const searchInput = document.getElementById('shortcut-search');
  const filterButtons = document.querySelectorAll('.btn-filter');
  const shortcutCards = document.querySelectorAll('.shortcut-card');
  const gridContainer = document.getElementById('shortcuts-grid');

  let currentCategory = 'all';
  let searchQuery = '';

  // Setup "No Results" message card
  const noResultsMsg = document.createElement('div');
  noResultsMsg.className = 'card';
  noResultsMsg.style.gridColumn = '1 / -1';
  noResultsMsg.style.textAlign = 'center';
  noResultsMsg.style.padding = '3rem';
  noResultsMsg.style.display = 'none';
  noResultsMsg.innerHTML = `
    <i class="fa-regular fa-face-frown" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
    <h3>找不到符合的快捷鍵</h3>
    <p style="color: var(--text-muted); margin-top: 0.5rem;">請嘗試使用其他關鍵字搜尋，例如「分割」、「新增」或「軌道」等。</p>
  `;
  gridContainer.appendChild(noResultsMsg);

  // Filter updates
  function updateList() {
    let visibleCount = 0;
    
    shortcutCards.forEach(card => {
      const cardName = card.querySelector('.shortcut-name').textContent.toLowerCase();
      const cardCatName = card.querySelector('.shortcut-cat').textContent.toLowerCase();
      const cardKey = card.querySelector('kbd').textContent.toLowerCase();
      const cardCategory = card.getAttribute('data-category');

      const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
      const matchesSearch = cardName.includes(searchQuery) || 
                            cardCatName.includes(searchQuery) || 
                            cardKey.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      noResultsMsg.style.display = 'block';
    } else {
      noResultsMsg.style.display = 'none';
    }
  }

  // Category buttons click events
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentCategory = btn.getAttribute('data-filter');
      updateList();
    });
  });

  // Search input typing event
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    updateList();
  });
}

/* ==========================================================================
   5. Dynamic Sidebar Table of Contents Navigation Link Observer
   ========================================================================== */
function initScrollObserver() {
  const sections = document.querySelectorAll('.section');
  const tocLinks = document.querySelectorAll('.toc-link');

  if (sections.length === 0 || tocLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Highlights as the section takes up the major center space
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        tocLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Sync click events to prevent visual delay
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      tocLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ==========================================================================
   6. Lightbox Image Viewer
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const zoomableImages = document.querySelectorAll('.filter-preview-img');

  zoomableImages.forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Disable page scrolling
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable page scrolling
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   7. Filter Media Tab & Step Carousel Controls
   ========================================================================== */
function initFilterMediaControls() {
  // Tabs logic (scoped to each media-tabs container)
  const mediaTabContainers = document.querySelectorAll('.filter-media-tabs');
  
  mediaTabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.media-tab-btn');
    const contents = container.querySelectorAll('.media-tab-content');
    
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        // Remove active from all buttons in this container
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Remove active from all contents in this container
        contents.forEach(c => c.classList.remove('active'));
        // Activate corresponding content
        if (contents[index]) {
          contents[index].classList.add('active');
        }
      });
    });
  });

  // Carousel logic (scoped to each carousel instance)
  const carousels = document.querySelectorAll('.text-step-carousel');
  
  carousels.forEach(carousel => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');
    
    if (slides.length === 0) return;

    let currentSlideIndex = 0;

    function showSlide(index) {
      if (index >= slides.length) currentSlideIndex = 0;
      else if (index < 0) currentSlideIndex = slides.length - 1;
      else currentSlideIndex = index;

      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentSlideIndex) slide.classList.add('active');
      });

      dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === currentSlideIndex) dot.classList.add('active');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlideIndex + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlideIndex - 1);
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slideTo = parseInt(dot.getAttribute('data-slide-to'), 10) - 1;
        showSlide(slideTo);
      });
    });
  });
}
