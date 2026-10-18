/**
 * Love Story Website Engine
 * Manages Chapter Transitions, History/URL hash, Keyboard Navigation, Lightbox & Celebrations
 */

(function () {
  'use strict';

  // State
  let stories = [];
  let currentChapterIndex = 0; // 0 to 29
  let currentScreen = 'welcome'; // 'welcome', 'story', 'gallery', 'birthday'

  // DOM Elements
  const appWrapper = document.getElementById('LoveStoryApp');
  const screenWelcome = document.getElementById('ScreenWelcome');
  const screenStory = document.getElementById('ScreenStory');
  const screenGallery = document.getElementById('ScreenGallery');
  const screenBirthday = document.getElementById('ScreenBirthday');

  const topbar = document.getElementById('LoveTopbar');
  const progressBar = document.getElementById('LoveProgressBar');
  const progressLabel = document.getElementById('LoveProgressLabel');
  const progressContainer = document.getElementById('StoryProgressContainer');

  const openHeartBtn = document.getElementById('OpenHeartBtn');
  const returnHomeBtn = document.getElementById('ReturnHomeBtn');
  const jumpToMemoriesBtn = document.getElementById('JumpToMemoriesBtn');
  const jumpToBirthdayBtn = document.getElementById('JumpToBirthdayBtn');

  // Story Elements
  const storyParchment = document.getElementById('StoryParchment');
  const storyChapterBadge = document.getElementById('StoryChapterBadge');
  const storyAtmosphere = document.getElementById('StoryAtmosphere');
  const storyTitle = document.getElementById('StoryTitle');
  const storyTextContent = document.getElementById('StoryTextContent');
  const btnPrevStory = document.getElementById('BtnPrevStory');
  const btnNextStory = document.getElementById('BtnNextStory');
  const nextBtnText = document.getElementById('NextBtnText');
  const currentChapterNum = document.getElementById('CurrentChapterNum');
  const totalChaptersNum = document.getElementById('TotalChaptersNum');

  // Gallery Elements
  const btnBackToPoemFromGallery = document.getElementById('BtnBackToPoemFromGallery');
  const btnGoToBirthday = document.getElementById('BtnGoToBirthday');
  const photoLightboxModal = document.getElementById('PhotoLightboxModal');
  const lightboxBackdrop = document.getElementById('LightboxBackdrop');
  const lightboxCloseBtn = document.getElementById('LightboxCloseBtn');
  const lightboxMediaWrapper = document.getElementById('LightboxMediaWrapper');
  const lightboxCaptionBar = document.getElementById('LightboxCaptionBar');

  // Birthday Elements
  const btnOpenBirthdayLetter = document.getElementById('BtnOpenBirthdayLetter');
  const birthdayLetterParchment = document.getElementById('BirthdayLetterParchment');
  const letterActionBox = document.getElementById('LetterActionBox');
  const btnBackToGallery = document.getElementById('BtnBackToGallery');
  const btnRestartJourney = document.getElementById('BtnRestartJourney');

  // 1. Initialize Stories Data
  function loadStoryData() {
    const dataScript = document.getElementById('LoveStoryData');
    if (dataScript) {
      try {
        stories = JSON.parse(dataScript.textContent);
      } catch (e) {
        console.error('Error parsing LoveStoryData JSON:', e);
      }
    }

    if (!stories || stories.length === 0) {
      console.warn('Fallback to fetch love-stories-data.json');
      fetch('/assets/love-stories-data.json')
        .then((res) => res.json())
        .then((data) => {
          stories = data;
          initApp();
        })
        .catch((err) => console.error('Failed to load stories:', err));
    } else {
      initApp();
    }
  }

  // 2. Main App Init
  function initApp() {
    if (totalChaptersNum) {
      totalChaptersNum.textContent = stories.length;
    }

    // Attach Event Listeners
    if (openHeartBtn) {
      openHeartBtn.addEventListener('click', () => {
        goToChapter(0);
      });
    }

    if (returnHomeBtn) {
      returnHomeBtn.addEventListener('click', () => {
        showScreen('welcome');
      });
    }

    if (jumpToMemoriesBtn) {
      jumpToMemoriesBtn.addEventListener('click', () => {
        showScreen('gallery');
      });
    }

    if (jumpToBirthdayBtn) {
      jumpToBirthdayBtn.addEventListener('click', () => {
        showScreen('birthday');
      });
    }

    if (btnPrevStory) {
      btnPrevStory.addEventListener('click', () => {
        if (currentChapterIndex > 0) {
          goToChapter(currentChapterIndex - 1);
        }
      });
    }

    if (btnNextStory) {
      btnNextStory.addEventListener('click', () => {
        if (currentChapterIndex < stories.length - 1) {
          goToChapter(currentChapterIndex + 1);
        } else {
          // After 30th story, transition to Memories Gallery
          showScreen('gallery');
        }
      });
    }

    if (btnBackToPoemFromGallery) {
      btnBackToPoemFromGallery.addEventListener('click', () => {
        goToChapter(stories.length - 1);
      });
    }

    if (btnGoToBirthday) {
      btnGoToBirthday.addEventListener('click', () => {
        showScreen('birthday');
      });
    }

    if (btnBackToGallery) {
      btnBackToGallery.addEventListener('click', () => {
        showScreen('gallery');
      });
    }

    if (btnRestartJourney) {
      btnRestartJourney.addEventListener('click', () => {
        try {
          localStorage.removeItem('love_story_last_chapter');
        } catch (e) {}
        showScreen('welcome');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (btnOpenBirthdayLetter) {
      btnOpenBirthdayLetter.addEventListener('click', () => {
        revealBirthdayLetter();
      });
    }

    // Lightbox modal listeners
    initLightbox();

    // Keyboard support
    initKeyboardNav();

    // Ambient floating hearts generator
    initFloatingHearts();

    // Handle URL hash or initial route
    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
  }

  // 3. Screen Switching Engine
  function showScreen(screenName, updateHistory = true) {
    currentScreen = screenName;
    if (appWrapper) {
      appWrapper.setAttribute('data-active-screen', screenName);
    }

    // Hide all screens
    [screenWelcome, screenStory, screenGallery, screenBirthday].forEach((el) => {
      if (el) {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    });

    // Update Topbar and Progress
    updateProgressIndicator(screenName);

    if (screenName === 'welcome') {
      if (screenWelcome) {
        screenWelcome.style.display = 'block';
        screenWelcome.classList.add('active');
      }
      if (updateHistory) updateHash('cover');
    } else if (screenName === 'story') {
      if (screenStory) {
        screenStory.style.display = 'block';
        screenStory.classList.add('active');
      }
    } else if (screenName === 'gallery') {
      if (screenGallery) {
        screenGallery.style.display = 'block';
        screenGallery.classList.add('active');
      }
      if (updateHistory) updateHash('memories');
    } else if (screenName === 'birthday') {
      if (screenBirthday) {
        screenBirthday.style.display = 'block';
        screenBirthday.classList.add('active');
      }
      if (updateHistory) updateHash('birthday');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 4. Chapter Rendering Engine
  function goToChapter(index, updateHistory = true) {
    if (!stories || index < 0 || index >= stories.length) return;

    currentChapterIndex = index;
    const story = stories[index];

    // Ensure story screen is visible
    showScreen('story', false);

    if (updateHistory) {
      updateHash('chapter-' + (index + 1));
    }

    // Save reading progress quietly
    try {
      localStorage.setItem('love_story_last_chapter', index);
    } catch (e) {}

    // Theme & visual variation
    if (storyParchment) {
      storyParchment.setAttribute('data-story-theme', story.theme || 'default');
      // Gentle fade re-trigger
      storyParchment.style.opacity = '0';
      storyParchment.style.transform = 'translateY(10px)';
      setTimeout(() => {
        storyParchment.style.transition = 'all 0.4s ease';
        storyParchment.style.opacity = '1';
        storyParchment.style.transform = 'translateY(0)';
      }, 50);
    }

    // Update text and titles
    if (storyChapterBadge) {
      storyChapterBadge.textContent = story.chapterLabel || 'Chapter ' + (index + 1) + ' of ' + stories.length;
    }

    if (storyAtmosphere) {
      storyAtmosphere.textContent = story.atmosphere ? story.atmosphere.toUpperCase() : 'MEMOIR';
    }

    if (storyTitle) {
      storyTitle.textContent = story.title;
    }

    if (currentChapterNum) {
      currentChapterNum.textContent = index + 1;
    }

    // Format & Render Stanzas with full preservation of line breaks and markdown bold
    if (storyTextContent) {
      storyTextContent.innerHTML = formatPoemContent(story.content);
    }

    // Configure Prev/Next Button states
    if (btnPrevStory) {
      if (index === 0) {
        btnPrevStory.disabled = true;
        btnPrevStory.style.visibility = 'hidden';
      } else {
        btnPrevStory.disabled = false;
        btnPrevStory.style.visibility = 'visible';
      }
    }

    if (btnNextStory) {
      if (index === stories.length - 1) {
        // 30th story: replace Next Chapter with "Our Beautiful Memories 📸"
        if (nextBtnText) {
          nextBtnText.textContent = 'Our Beautiful Memories 📸';
        }
      } else {
        if (nextBtnText) {
          nextBtnText.textContent = 'Next Chapter ❤️';
        }
      }
    }

    updateProgressIndicator('story');
  }

  // 5. Format Raw Stanza Text into clean HTML
  function formatPoemContent(raw) {
    if (!raw) return '';

    // Split by double newline into stanzas/paragraphs
    const paragraphs = raw.split(/\n\s*\n/);

    return paragraphs
      .map((para) => {
        let trimmed = para.trim();
        if (!trimmed) return '';

        // Bold formatting **text** -> <strong>text</strong>
        trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic formatting *text* -> <em>$1</em>
        trimmed = trimmed.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Replace single newlines with <br> for verse breaks
        trimmed = trimmed.replace(/\n/g, '<br>');

        return '<p class="story-paragraph">' + trimmed + '</p>';
      })
      .join('');
  }

  // 6. Progress Indicator Update
  function updateProgressIndicator(screen) {
    if (!progressBar || !progressLabel || !progressContainer) return;

    let percent = 0;
    let label = 'Cover';

    if (screen === 'welcome') {
      percent = 2;
      label = 'Cover';
    } else if (screen === 'story') {
      const step = ((currentChapterIndex + 1) / (stories.length + 2)) * 100;
      percent = Math.min(Math.round(step), 92);
      label = 'Story ' + (currentChapterIndex + 1) + ' of ' + stories.length;
    } else if (screen === 'gallery') {
      percent = 95;
      label = 'Our Memories';
    } else if (screen === 'birthday') {
      percent = 100;
      label = '19 October ❤️';
    }

    progressBar.style.width = percent + '%';
    progressLabel.textContent = label;
    progressContainer.setAttribute('aria-valuenow', percent);
  }

  // 7. Hash & History Navigation
  function updateHash(hash) {
    if (window.location.hash.slice(1) !== hash) {
      history.pushState(null, '', '#' + hash);
    }
  }

  function handleHashNavigation() {
    const hash = window.location.hash.slice(1).toLowerCase();

    if (!hash || hash === 'cover' || hash === 'welcome') {
      showScreen('welcome', false);
    } else if (hash.startsWith('story-') || hash.startsWith('chapter-')) {
      const cleanNumStr = hash.replace('story-', '').replace('chapter-', '');
      const num = parseInt(cleanNumStr, 10);
      if (!isNaN(num) && num >= 1 && num <= stories.length) {
        goToChapter(num - 1, false);
      } else {
        goToChapter(0, false);
      }
    } else if (hash === 'memories' || hash === 'gallery') {
      showScreen('gallery', false);
    } else if (hash === 'birthday') {
      showScreen('birthday', false);
    }
  }

  // 8. Keyboard Arrow Navigation
  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Ignore if inside modal or form
      if (photoLightboxModal && photoLightboxModal.style.display !== 'none') {
        if (e.key === 'Escape') {
          closeLightbox();
        }
        return;
      }

      if (currentScreen === 'story') {
        if (e.key === 'ArrowRight') {
          if (currentChapterIndex < stories.length - 1) {
            goToChapter(currentChapterIndex + 1);
          } else {
            showScreen('gallery');
          }
        } else if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
          goToChapter(currentChapterIndex - 1);
        }
      }
    });
  }

  // 9. Lightbox Photo Viewer
  function initLightbox() {
    const polaroidItems = document.querySelectorAll('.memory-polaroid');
    polaroidItems.forEach((item) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('.polaroid-img');
        const caption = item.querySelector('.polaroid-caption');
        const placeholderText = item.querySelector('.placeholder-caption-tip');

        if (img) {
          openLightbox('<img src="' + img.src + '" alt="' + (img.alt || 'Our Memory') + '">', caption ? caption.textContent : '');
        } else if (placeholderText) {
          openLightbox(
            '<div class="polaroid-placeholder" style="padding: 40px; font-size: 1.2rem;"><span style="font-size: 3rem;">📸</span><p>' +
              placeholderText.textContent +
              '</p></div>',
            caption ? caption.textContent : ''
          );
        }
      });
    });

    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  function openLightbox(mediaHtml, captionText) {
    if (!photoLightboxModal || !lightboxMediaWrapper) return;
    lightboxMediaWrapper.innerHTML = mediaHtml;
    if (lightboxCaptionBar) {
      lightboxCaptionBar.textContent = captionText || '';
    }
    photoLightboxModal.style.display = 'flex';
    photoLightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!photoLightboxModal) return;
    photoLightboxModal.style.display = 'none';
    photoLightboxModal.setAttribute('aria-hidden', 'true');
  }

  // 10. Reveal Final Birthday Letter
  function revealBirthdayLetter() {
    if (birthdayLetterParchment) {
      birthdayLetterParchment.style.display = 'block';
      birthdayLetterParchment.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (letterActionBox) {
      letterActionBox.style.display = 'none';
    }
    createCelebrationConfetti();
  }

  // 11. Subtle Ambient Floating Hearts
  function initFloatingHearts() {
    const container = document.getElementById('AmbientHearts');
    if (!container) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const hearts = ['❤️', '🤍', '✦', '❦', '🌸'];

    setInterval(() => {
      if (document.hidden) return;
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = Math.random() * 96 + 2 + 'vw';
      heart.style.animationDuration = Math.random() * 8 + 14 + 's';
      heart.style.fontSize = Math.random() * 10 + 10 + 'px';
      container.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 22000);
    }, 2800);
  }

  // Subtle Celebratory particles on opening the final letter
  function createCelebrationConfetti() {
    const container = document.getElementById('AmbientHearts');
    if (!container) return;

    const symbols = ['✨', '❤️', '🎉', '🌸', '💫'];
    for (let i = 0; i < 28; i++) {
      const spark = document.createElement('span');
      spark.className = 'floating-heart';
      spark.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      spark.style.left = Math.random() * 90 + 5 + 'vw';
      spark.style.animationDuration = Math.random() * 4 + 6 + 's';
      spark.style.fontSize = Math.random() * 12 + 14 + 'px';
      container.appendChild(spark);

      setTimeout(() => {
        spark.remove();
      }, 9000);
    }
  }

  // Kickoff on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStoryData);
  } else {
    loadStoryData();
  }
})();
