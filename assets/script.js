
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const menu = document.querySelector('.menu-toggle');
  const links = document.querySelector('.pro-links');
  if (menu && links) menu.addEventListener('click', () => links.classList.toggle('open'));

  // Theme
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('medminuteTheme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  if (themeToggle) themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('medminuteTheme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  // Search
  const overlay = document.getElementById('searchOverlay');
  const openSearch = document.getElementById('globalSearchButton');
  const closeSearch = document.getElementById('closeSearch');
  const input = document.getElementById('globalSearchInput');
  const results = document.getElementById('globalSearchResults');
  function closeOverlay(){ if(overlay){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');} }
  if(openSearch && overlay) openSearch.addEventListener('click',()=>{
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');
    setTimeout(()=>input && input.focus(),50);
  });
  if(closeSearch) closeSearch.addEventListener('click',closeOverlay);
  if(overlay) overlay.addEventListener('click',e=>{if(e.target===overlay)closeOverlay();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay();});
  if(input && results){
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      results.innerHTML='';
      if(!q) return;
      const items=(window.MEDMINUTE_SEARCH_INDEX||[]).filter(item =>
        `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(q)
      ).slice(0,12);
      if(!items.length){results.innerHTML='<div class="search-result"><strong>No results found</strong><p>Try a broader term.</p></div>';return;}
      items.forEach(item=>{
        const a=document.createElement('a');
        a.href=item.url;a.className='search-result';
        a.innerHTML=`<span>${item.category}</span><strong>${item.title}</strong><p>${item.description||'Open this MedMinute resource.'}</p>`;
        results.appendChild(a);
      });
    });
  }

  // Existing Academy tabs
  document.querySelectorAll('.note-tabs').forEach(group=>{
    const host=group.closest('.card')||group.parentElement;
    const buttons=[...group.querySelectorAll('.tab-button')];
    const panels=[...host.querySelectorAll('.tab-panel')];
    buttons.forEach(btn=>btn.addEventListener('click',()=>{
      buttons.forEach(b=>b.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      const target=panels.find(p=>p.dataset.panel===btn.dataset.tab);
      if(target)target.classList.add('active');
    }));
  });

  document.querySelectorAll('.flashcard').forEach(card=>{
    card.setAttribute('tabindex','0');
    const flip=()=>card.classList.toggle('flipped');
    card.addEventListener('click',flip);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});
  });

  document.querySelectorAll('.answer-button:not(.check-case)').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const ans=(btn.nextElementSibling&&btn.nextElementSibling.classList.contains('answer-text'))?btn.nextElementSibling:btn.parentElement.querySelector('.answer-text');
      if(!ans)return;
      const open=getComputedStyle(ans).display==='none';
      ans.style.display=open?'block':'none';
      btn.textContent=open?'Hide answer':'Show answer';
    });
  });

  // Health Library expandable search
  const sectionSearch=document.getElementById('librarySectionSearch');
  if(sectionSearch){
    const blocks=[...document.querySelectorAll('.expandable-system')];
    const empty=document.getElementById('sectionSearchEmpty');
    sectionSearch.addEventListener('input',()=>{
      const q=sectionSearch.value.trim().toLowerCase();let shown=0;
      blocks.forEach(block=>{
        const ok=!q||block.textContent.toLowerCase().includes(q);
        block.style.display=ok?'block':'none';
        if(ok){shown++;if(q)block.open=true;}
      });
      if(empty)empty.style.display=shown?'none':'block';
    });
  }

  // Dictionary search
  const dictionarySearch=document.getElementById('dictionarySearch');
  if(dictionarySearch){
    const rows=[...document.querySelectorAll('#dictionaryBody tr')];
    dictionarySearch.addEventListener('input',()=>{
      const q=dictionarySearch.value.trim().toLowerCase();
      rows.forEach(row=>row.style.display=!q||row.textContent.toLowerCase().includes(q)?'':'none');
    });
  }

  // Symptom explorer
  const symptomButtons=[...document.querySelectorAll('.symptom-button')];
  const symptomPanels=[...document.querySelectorAll('.symptom-panel')];
  symptomButtons.forEach(btn=>btn.addEventListener('click',()=>{
    symptomButtons.forEach(b=>b.classList.remove('active'));
    symptomPanels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const target=symptomPanels.find(p=>p.dataset.symptomPanel===btn.dataset.symptom);
    if(target)target.classList.add('active');
  }));

  // Anatomy
  const organButtons=[...document.querySelectorAll('.organ-button')];
  const organPanels=[...document.querySelectorAll('.organ-info')];
  organButtons.forEach(btn=>btn.addEventListener('click',()=>{
    organButtons.forEach(b=>b.classList.remove('active'));
    organPanels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const target=organPanels.find(p=>p.dataset.organInfo===btn.dataset.organ);
    if(target)target.classList.add('active');
  }));

  // Skills
  const skillButtons=[...document.querySelectorAll('.skill-select')];
  const skillPanels=[...document.querySelectorAll('.skill-detail')];
  skillButtons.forEach(btn=>btn.addEventListener('click',()=>{
    skillPanels.forEach(p=>p.classList.remove('active'));
    const target=skillPanels.find(p=>p.dataset.skillDetail===btn.dataset.skill);
    if(target){target.classList.add('active');target.scrollIntoView({behavior:'smooth',block:'start'});}
  }));

  // Case challenges
  const caseCards=[...document.querySelectorAll('.case-card')];
  if(caseCards.length){
    let current=0,score=0;
    const progress=document.getElementById('caseProgress'),scoreLabel=document.getElementById('caseScore');
    const prev=document.getElementById('prevCase'),next=document.getElementById('nextCase');
    const render=()=>{
      caseCards.forEach((c,i)=>c.classList.toggle('active',i===current));
      if(progress)progress.textContent=`Case ${current+1} of ${caseCards.length}`;
      if(prev)prev.disabled=current===0;
      if(next)next.textContent=current===caseCards.length-1?'Restart':'Next';
    };
    caseCards.forEach(card=>{
      const choices=[...card.querySelectorAll('.case-choice')],check=card.querySelector('.check-case'),feedback=card.querySelector('.case-feedback');
      choices.forEach(choice=>choice.addEventListener('click',()=>{
        if(card.dataset.answered==='true')return;
        choices.forEach(c=>c.classList.remove('selected'));choice.classList.add('selected');
      }));
      if(check)check.addEventListener('click',()=>{
        if(card.dataset.answered==='true')return;
        const selected=card.querySelector('.case-choice.selected');
        if(!selected){if(feedback){feedback.style.display='block';feedback.textContent='Please select an answer before checking.';}return;}
        const correct=Number(card.dataset.correct),chosen=Number(selected.dataset.index),good=correct===chosen;
        card.dataset.answered='true';
        choices.forEach(choice=>{
          const i=Number(choice.dataset.index);
          if(i===correct)choice.classList.add('correct');
          if(choice===selected&&!good)choice.classList.add('incorrect');
        });
        if(feedback){
          const original=feedback.dataset.explanation||feedback.textContent.trim();
          feedback.dataset.explanation=original;feedback.style.display='block';
          feedback.innerHTML=`<strong>${good?'Correct.':'Not quite.'}</strong><br>${original}`;
        }
        if(good){score++;if(scoreLabel)scoreLabel.textContent=`Score: ${score}`;}
      });
    });
    if(prev)prev.addEventListener('click',()=>{if(current>0){current--;render();}});
    if(next)next.addEventListener('click',()=>{current=current===caseCards.length-1?0:current+1;render();});
    render();
  }

  // Final exams
  const switches=[...document.querySelectorAll('[data-exam-target]')];
  switches.forEach(btn=>btn.addEventListener('click',()=>{
    switches.forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.final-exam').forEach(e=>e.classList.remove('active'));
    btn.classList.add('active');
    const target=document.getElementById(`${btn.dataset.examTarget}Exam`);
    if(target)target.classList.add('active');
  }));
  document.querySelectorAll('.exam-submit').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.exam,exam=document.getElementById(`${id}Exam`),result=document.getElementById(`${id}Result`);
    if(!exam||!result)return;
    const questions=[...exam.querySelectorAll('.exam-question')],unanswered=questions.filter(q=>!q.querySelector('input:checked'));
    if(unanswered.length){
      result.style.display='block';
      result.innerHTML=`<strong>Almost there</strong>Please answer all questions. ${unanswered.length} remain.`;
      return;
    }
    let score=0;
    questions.forEach(q=>{if(Number(q.querySelector('input:checked').value)===Number(q.dataset.correct))score++;});
    const percent=Math.round(score/questions.length*100);
    let message=percent>=90?'Excellent work — your understanding is very strong.':
      percent>=80?'Great work — only a few areas need review.':
      percent>=70?'Good progress — review the most difficult topics and try again.':
      percent>=60?'You are building a solid foundation — focused review can raise your score.':
      'Keep going — use this score as a guide, review carefully and try again when ready.';
    result.style.display='block';result.innerHTML=`<strong>${score}/${questions.length} (${percent}%)</strong>${message}`;
    localStorage.setItem(`medminute_${id}_score`,String(percent));
  }));

  // Challenge
  const challengeCards=[...document.querySelectorAll('.challenge-day')];
  if(challengeCards.length){
    const key='medminuteChallengeProgress';let completed=[];
    try{completed=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){completed=[]}
    const update=()=>{
      challengeCards.forEach(c=>c.classList.toggle('completed',completed.includes(Number(c.dataset.day))));
      const count=completed.length,bar=document.getElementById('challengeProgressBar'),text=document.getElementById('challengeProgressText');
      if(bar)bar.style.width=`${count/challengeCards.length*100}%`;
      if(text)text.textContent=`${count} of ${challengeCards.length} days completed`;
      localStorage.setItem(key,JSON.stringify(completed));
    };
    challengeCards.forEach(c=>c.addEventListener('click',()=>{
      const day=Number(c.dataset.day);
      completed=completed.includes(day)?completed.filter(x=>x!==day):[...completed,day];
      update();
    }));
    const reset=document.getElementById('resetChallenge');
    if(reset)reset.addEventListener('click',()=>{completed=[];update();});
    update();
  }

  // Calculators
  const show=(id,msg)=>{const e=document.getElementById(id);if(e){e.style.display='block';e.textContent=msg;}};
  const bmi=document.getElementById('calculateBMI');
  if(bmi)bmi.addEventListener('click',()=>{
    const h=Number(document.getElementById('bmiHeight').value),w=Number(document.getElementById('bmiWeight').value);
    if(!(h>0&&w>0))return show('bmiResult','Enter valid height and weight values.');
    show('bmiResult',`BMI: ${(w/Math.pow(h/100,2)).toFixed(1)} kg/m². Screening value only.`);
  });
  const bsa=document.getElementById('calculateBSA');
  if(bsa)bsa.addEventListener('click',()=>{
    const h=Number(document.getElementById('bsaHeight').value),w=Number(document.getElementById('bsaWeight').value);
    if(!(h>0&&w>0))return show('bsaResult','Enter valid height and weight values.');
    show('bsaResult',`Estimated BSA: ${Math.sqrt(h*w/3600).toFixed(2)} m².`);
  });
  const map=document.getElementById('calculateMAP');
  if(map)map.addEventListener('click',()=>{
    const s=Number(document.getElementById('mapSystolic').value),d=Number(document.getElementById('mapDiastolic').value);
    if(!(s>0&&d>0&&s>=d))return show('mapResult','Enter valid blood-pressure values.');
    show('mapResult',`Estimated MAP: ${((s+2*d)/3).toFixed(1)} mmHg.`);
  });
  const calcium=document.getElementById('calculateCalcium');
  if(calcium)calcium.addEventListener('click',()=>{
    const c=Number(document.getElementById('calciumValue').value),a=Number(document.getElementById('albuminValue').value);
    if(!(c>0&&a>0))return show('calciumResult','Enter valid calcium and albumin values.');
    show('calciumResult',`Estimated corrected calcium: ${(c+.8*(4-a)).toFixed(2)} mg/dL.`);
  });

  // Homepage dashboard
  const challenge=(()=>{try{return JSON.parse(localStorage.getItem('medminuteChallengeProgress')||'[]').length}catch(e){return 0}})();
  const challengePercent=Math.round(challenge/30*100);
  const cp=document.getElementById('homeChallengePercent'),cb=document.getElementById('homeChallengeBar');
  if(cp)cp.textContent=`${challengePercent}%`; if(cb)cb.style.width=`${challengePercent}%`;
  ['bio','chem'].forEach(id=>{
    const score=Number(localStorage.getItem(`medminute_${id}_score`)||0);
    const label=document.getElementById(id==='bio'?'homeBioScore':'homeChemScore');
    const bar=document.getElementById(id==='bio'?'homeBioBar':'homeChemBar');
    if(label)label.textContent=score?`${score}%`:'Not attempted';
    if(bar)bar.style.width=`${score}%`;
  });
  const today=new Date().toDateString(),last=localStorage.getItem('medminuteLastVisit');
  let streak=Number(localStorage.getItem('medminuteStreak')||0);
  if(last!==today){streak=Math.max(1,streak+1);localStorage.setItem('medminuteLastVisit',today);localStorage.setItem('medminuteStreak',String(streak));}
  const streakEl=document.getElementById('learningStreak');if(streakEl)streakEl.textContent=streak||1;
});

// MedMinute AI client
document.addEventListener('DOMContentLoaded', () => {
  const questionInput = document.getElementById('aiQuestion');
  const askButton = document.getElementById('askAIButton');
  const messages = document.getElementById('aiMessages');
  const status = document.getElementById('aiStatus');
  const clearButton = document.getElementById('clearAIChat');
  if (!questionInput || !askButton || !messages) return;

  const history = [];

  function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function addMessage(role, content, sources = []) {
    const wrapper = document.createElement('div');
    wrapper.className = `ai-message ${role}`;
    const sourceHTML = sources.length
      ? `<div class="ai-sources">${sources.map(s =>
          `<a class="ai-source-link" href="${encodeURI(s.url)}">${escapeHTML(s.title)}</a>`
        ).join('')}</div>`
      : '';
    wrapper.innerHTML = `
      <div class="ai-message-label">${role === 'user' ? 'You' : 'MedMinute AI'}</div>
      <div class="ai-bubble">${escapeHTML(content).replace(/\n/g,'<br>')}${sourceHTML}</div>`;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function addThinking() {
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-message assistant';
    wrapper.id = 'aiThinkingMessage';
    wrapper.innerHTML = `<div class="ai-message-label">MedMinute AI</div>
      <div class="ai-bubble"><span class="ai-thinking"><span></span><span></span><span></span></span></div>`;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  async function ask() {
    const question = questionInput.value.trim();
    if (!question) return;
    addMessage('user', question);
    history.push({role:'user', content:question});
    questionInput.value = '';
    askButton.disabled = true;
    if (status) status.textContent = 'Reviewing MedMinute sources...';
    addThinking();

    try {
      const response = await fetch('/api/ask', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question, history:history.slice(-8)})
      });
      const data = await response.json();
      document.getElementById('aiThinkingMessage')?.remove();
      if (!response.ok) throw new Error(data.error || 'The assistant could not respond.');
      addMessage('assistant', data.answer, data.sources || []);
      history.push({role:'assistant', content:data.answer});
      if (status) status.textContent = 'Answered from MedMinute content';
    } catch (error) {
      document.getElementById('aiThinkingMessage')?.remove();
      addMessage('assistant',
        'MedMinute AI is installed, but the secure AI server is not currently connected. Start the included server and add your OpenAI API key to activate real AI responses. The setup instructions are included in the website package.'
      );
      if (status) status.textContent = 'AI server not connected';
    } finally {
      askButton.disabled = false;
      questionInput.focus();
    }
  }

  askButton.addEventListener('click', ask);
  questionInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      ask();
    }
  });
  document.querySelectorAll('.ai-suggestion').forEach(button => {
    button.addEventListener('click', () => {
      questionInput.value = button.textContent.trim();
      questionInput.focus();
    });
  });
  if (clearButton) clearButton.addEventListener('click', () => {
    history.length = 0;
    messages.innerHTML = `<div class="ai-message assistant">
      <div class="ai-message-label">MedMinute AI</div>
      <div class="ai-bubble">The conversation has been cleared. What would you like to learn?</div>
    </div>`;
  });
});

// MedMinute AI Tutor
document.addEventListener('DOMContentLoaded', () => {
  const runButton = document.getElementById('runTutor');
  if (!runButton) return;

  const topicInput = document.getElementById('tutorTopic');
  const levelSelect = document.getElementById('tutorLevel');
  const courseSelect = document.getElementById('tutorCourse');
  const promptInput = document.getElementById('tutorPrompt');
  const activity = document.getElementById('tutorActivity');
  const conversation = document.getElementById('tutorConversation');
  const status = document.getElementById('tutorStatus');
  const clearSession = document.getElementById('clearTutorSession');
  const resetProgress = document.getElementById('resetTutorProgress');
  const masterySummary = document.getElementById('masterySummary');
  const modeButtons = [...document.querySelectorAll('.tutor-mode')];

  let mode = 'teach';
  let sessionHistory = [];
  let currentFollowup = null;
  const progressKey = 'medminuteTutorMastery';

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(progressKey) || '{}'); }
    catch (e) { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(progressKey, JSON.stringify(progress));
    renderMastery();
  }

  function updateMastery(topic, score) {
    if (!topic) return;
    const progress = loadProgress();
    const key = topic.trim().toLowerCase();
    const existing = progress[key] || {topic, attempts:0, average:0};
    existing.average = Math.round(((existing.average * existing.attempts) + score) / (existing.attempts + 1));
    existing.attempts += 1;
    existing.topic = topic;
    progress[key] = existing;
    saveProgress(progress);
  }

  function renderMastery() {
    const progress = loadProgress();
    const items = Object.values(progress).sort((a,b) => b.attempts - a.attempts).slice(0,8);
    if (!items.length) {
      masterySummary.innerHTML = '<p class="small">Complete quizzes and tutor questions to build your mastery profile.</p>';
      return;
    }
    masterySummary.innerHTML = items.map(item => `
      <div class="mastery-row">
        <div class="mastery-row-head"><span>${escapeHTML(item.topic)}</span><span>${item.average}%</span></div>
        <div class="mastery-track"><span style="width:${item.average}%"></span></div>
      </div>`).join('');
  }

  function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  }

  function addConversation(role, content) {
    const div = document.createElement('div');
    div.className = `ai-message ${role}`;
    div.innerHTML = `<div class="ai-message-label">${role === 'user' ? 'You' : 'AI Tutor'}</div>
      <div class="ai-bubble">${escapeHTML(content).replace(/\n/g,'<br>')}</div>`;
    conversation.appendChild(div);
    conversation.scrollTop = conversation.scrollHeight;
  }

  function setLoading(loading) {
    runButton.disabled = loading;
    runButton.textContent = loading ? 'Tutor is thinking...' : 'Start Tutor';
    if (status) status.textContent = loading ? 'Reviewing MedMinute and preparing your activity...' : 'Ready';
    if (loading) {
      activity.innerHTML = '<div class="tutor-content"><div class="skeleton-stack"><div></div><div></div><div></div><div></div></div><p class="small" style="margin-top:16px">Building a grounded learning activity...</p></div>';
    }
  }

  function renderTeach(data) {
    activity.innerHTML = `<article class="tutor-content">
      <span class="eyebrow">Teacher Explanation</span>
      <h2>${escapeHTML(data.title || topicInput.value)}</h2>
      ${(data.sections || []).map(s => `<h3>${escapeHTML(s.heading)}</h3><p>${escapeHTML(s.content)}</p>`).join('')}
      ${data.check_question ? `<div class="notice"><strong>Check your understanding:</strong> ${escapeHTML(data.check_question)}</div>` : ''}
      ${renderSources(data.sources)}
    </article>`;
  }

  function renderFlashcards(data) {
    activity.innerHTML = `<div class="tutor-content"><span class="eyebrow">Generated Flashcards</span>
      <h2>${escapeHTML(data.title || 'Study Flashcards')}</h2>
      <p>Click each card to reveal the answer.</p>
      <div class="generated-flashcards">${(data.flashcards || []).map(card => `
        <div class="generated-card"><div class="generated-card-inner">
          <div class="generated-card-front">${escapeHTML(card.front)}</div>
          <div class="generated-card-back">${escapeHTML(card.back)}</div>
        </div></div>`).join('')}</div>${renderSources(data.sources)}</div>`;
    activity.querySelectorAll('.generated-card').forEach(card =>
      card.addEventListener('click', () => card.classList.toggle('flipped'))
    );
  }

  function renderQuiz(data) {
    const questions = data.questions || [];
    activity.innerHTML = `<div class="tutor-content"><span class="eyebrow">Generated Quiz</span>
      <h2>${escapeHTML(data.title || 'Practice Quiz')}</h2>
      <p>Answer every question, then submit for your score and explanations.</p>
      <div id="generatedQuiz">${questions.map((q,i) => `
        <section class="generated-quiz-question" data-correct="${Number(q.correct_index)}">
          <h3>${i+1}. ${escapeHTML(q.question)}</h3>
          ${(q.options || []).map((opt,j) => `<button class="generated-option" data-option="${j}" type="button">${escapeHTML(opt)}</button>`).join('')}
          <div class="answer-text" style="display:none">${escapeHTML(q.explanation || '')}</div>
        </section>`).join('')}</div>
      <button id="submitGeneratedQuiz" class="btn btn-primary" type="button">Submit Quiz</button>
      <div id="generatedQuizResult"></div>${renderSources(data.sources)}</div>`;

    activity.querySelectorAll('.generated-quiz-question').forEach(q => {
      q.querySelectorAll('.generated-option').forEach(button => {
        button.addEventListener('click', () => {
          q.querySelectorAll('.generated-option').forEach(b => b.classList.remove('selected'));
          button.classList.add('selected');
        });
      });
    });

    document.getElementById('submitGeneratedQuiz')?.addEventListener('click', () => {
      const questionEls = [...activity.querySelectorAll('.generated-quiz-question')];
      if (questionEls.some(q => !q.querySelector('.generated-option.selected'))) {
        document.getElementById('generatedQuizResult').innerHTML =
          '<div class="warning" style="margin-top:16px">Please answer every question before submitting.</div>';
        return;
      }
      let score = 0;
      questionEls.forEach(q => {
        const selected = q.querySelector('.generated-option.selected');
        const chosen = Number(selected.dataset.option);
        const correct = Number(q.dataset.correct);
        q.querySelectorAll('.generated-option').forEach(button => {
          const index = Number(button.dataset.option);
          if (index === correct) button.classList.add('correct');
          if (button === selected && chosen !== correct) button.classList.add('incorrect');
          button.disabled = true;
        });
        q.querySelector('.answer-text').style.display = 'block';
        if (chosen === correct) score++;
      });
      const percent = Math.round(score / questionEls.length * 100);
      updateMastery(topicInput.value || data.topic || 'Current topic', percent);
      document.getElementById('generatedQuizResult').innerHTML =
        `<div class="quiz-result-panel" style="margin-top:18px"><h3>${score}/${questionEls.length} (${percent}%)</h3>
        <p>${percent >= 90 ? 'Excellent mastery.' : percent >= 75 ? 'Strong progress. Review the explanations for missed questions.' : 'Keep building your understanding, review the topic and try another quiz.'}</p></div>`;
    });
  }

  function renderFollowup(data) {
    currentFollowup = data;
    activity.innerHTML = `<div class="tutor-content">
      <span class="eyebrow">One-to-One Tutor Question</span>
      <h2>${escapeHTML(data.question)}</h2>
      <p>${escapeHTML(data.prompt || 'Type your answer in the box below, then press Check My Answer.')}</p>
      <button id="checkFollowupAnswer" class="btn btn-primary" type="button">Check My Answer</button>
      ${renderSources(data.sources)}
    </div>`;
    runButton.textContent = 'Ask Another Question';
    document.getElementById('checkFollowupAnswer')?.addEventListener('click', checkFollowup);
  }

  async function checkFollowup() {
    const answer = promptInput.value.trim();
    if (!answer || !currentFollowup) return;
    setLoading(true);
    try {
      const response = await fetch('/api/tutor', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:'evaluate',
          topic:topicInput.value,
          level:levelSelect.value,
          course:courseSelect.value,
          user_answer:answer,
          question:currentFollowup.question,
          expected_answer:currentFollowup.expected_answer,
          history:sessionHistory.slice(-10),
          mastery:loadProgress()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not evaluate answer.');
      activity.insertAdjacentHTML('beforeend', `<div class="${data.correct ? 'success' : 'notice'}" style="margin-top:16px">
        <strong>${data.correct ? 'Correct or substantially correct.' : 'Good attempt — review this point.'}</strong>
        <p>${escapeHTML(data.feedback)}</p><p><strong>Model answer:</strong> ${escapeHTML(data.model_answer)}</p></div>`);
      updateMastery(topicInput.value || 'Tutor topic', data.score || (data.correct ? 100 : 50));
      sessionHistory.push({role:'user',content:answer},{role:'assistant',content:data.feedback});
      promptInput.value = '';
    } catch (error) {
      activity.insertAdjacentHTML('beforeend', `<div class="warning">${escapeHTML(error.message)}</div>`);
    } finally {
      setLoading(false);
    }
  }

  function renderRecommendations(data) {
    activity.innerHTML = `<div class="tutor-content"><span class="eyebrow">Personalized Study Plan</span>
      <h2>${escapeHTML(data.title || 'Recommended next lessons')}</h2>
      <div class="recommendation-list">${(data.recommendations || []).map(item => `
        <div class="recommendation-item"><strong>${escapeHTML(item.topic)}</strong>
        <p>${escapeHTML(item.reason)}</p>${item.url ? `<a class="btn btn-secondary" href="${encodeURI(item.url)}">Open lesson</a>` : ''}</div>`).join('')}</div>
      ${renderSources(data.sources)}</div>`;
  }

  function renderSources(sources) {
    if (!sources || !sources.length) return '';
    return `<div class="ai-sources" style="margin-top:20px">${sources.map(s =>
      `<a class="ai-source-link" href="${encodeURI(s.url)}">${escapeHTML(s.title)}</a>`
    ).join('')}</div>`;
  }

  async function runTutor() {
    const topic = topicInput.value.trim();
    const extra = promptInput.value.trim();

    if (!topic && mode !== 'recommend') {
      activity.innerHTML = '<div class="warning">Enter a topic before starting the tutor.</div>';
      return;
    }

    addConversation('user', `${mode.toUpperCase()}: ${topic || 'Recommend my next lesson'}${extra ? ` — ${extra}` : ''}`);
    setLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          action:mode,
          topic,
          level:levelSelect.value,
          course:courseSelect.value,
          instruction:extra,
          history:sessionHistory.slice(-10),
          mastery:loadProgress()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tutor could not respond.');

      if (mode === 'teach' || mode === 'alberta') renderTeach(data);
      else if (mode === 'flashcards') renderFlashcards(data);
      else if (mode === 'quiz') renderQuiz(data);
      else if (mode === 'followup') renderFollowup(data);
      else if (mode === 'recommend') renderRecommendations(data);

      sessionHistory.push({role:'user',content:`${mode}: ${topic} ${extra}`});
      sessionHistory.push({role:'assistant',content:data.summary || data.title || 'Tutor activity generated'});
      addConversation('assistant', data.summary || `Your ${mode} activity is ready below.`);
      promptInput.value = '';
      if (status) status.textContent = 'Activity generated from MedMinute content';
    } catch (error) {
      activity.innerHTML = `<div class="warning"><strong>AI Tutor is not connected.</strong>
        <p>${escapeHTML(error.message)}</p>
        <p>Run the included secure server and configure the OpenAI environment variables. See AI_SETUP.txt.</p></div>`;
      if (status) status.textContent = 'Secure AI server not connected';
    } finally {
      setLoading(false);
    }
  }

  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      mode = button.dataset.mode;
      runButton.textContent = mode === 'recommend' ? 'Recommend My Next Lesson' : 'Start Tutor';
      if (mode === 'alberta' && !courseSelect.value) courseSelect.value = 'Biology 20';
    });
  });

  runButton.addEventListener('click', runTutor);
  promptInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && mode !== 'followup') {
      event.preventDefault();
      runTutor();
    }
  });

  clearSession.addEventListener('click', () => {
    sessionHistory = [];
    currentFollowup = null;
    conversation.innerHTML = `<div class="ai-message assistant"><div class="ai-message-label">AI Tutor</div>
      <div class="ai-bubble">New session started. What would you like to learn?</div></div>`;
    activity.innerHTML = '';
    promptInput.value = '';
  });

  resetProgress.addEventListener('click', () => {
    localStorage.removeItem(progressKey);
    renderMastery();
  });

  renderMastery();
});

// MedMinute 3.3 Biology animations
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.bio-animation-module .animation-controls').forEach(controls => {
    const module = controls.closest('.bio-animation-module');
    controls.querySelector('[data-action="play"]')?.addEventListener('click', () => {
      module.classList.add('playing');
      module.classList.remove('paused');
    });
    controls.querySelector('[data-action="pause"]')?.addEventListener('click', () => {
      module.classList.add('paused');
    });
    controls.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      module.classList.remove('playing','paused');
      void module.offsetWidth;
    });
  });

  const light = document.getElementById('lightSlider');
  const co2 = document.getElementById('co2Slider');
  const bar = document.getElementById('photoRateBar');
  const caption = document.getElementById('photoCaption');
  function updatePhotosynthesis() {
    if (!light || !co2 || !bar || !caption) return;
    const limitingRate = Math.min(Number(light.value), Number(co2.value));
    bar.style.width = `${limitingRate}%`;
    caption.textContent = `Estimated relative rate: ${limitingRate}% — the lower factor limits the reaction.`;
    const sun = document.querySelector('.photo-stage .sun');
    if (sun) sun.style.opacity = String(0.25 + Number(light.value)/135);
    const co2Flow = document.querySelector('.photo-stage .co2-flow');
    if (co2Flow) co2Flow.style.opacity = String(0.25 + Number(co2.value)/135);
  }
  light?.addEventListener('input', updatePhotosynthesis);
  co2?.addEventListener('input', updatePhotosynthesis);
  updatePhotosynthesis();
});

// MedMinute 3.4 stability, progress, achievements and accessibility
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE = {
    views: 'medminutePageViews',
    recent: 'medminuteRecentPages',
    achievements: 'medminuteAchievements',
    cases: 'medminuteCasesCompleted',
    clinical: 'medminuteClinicalSkillsViewed',
    accessibility: 'medminuteAccessibility'
  };

  const achievements = [
    {id:'first-step', icon:'🚀', title:'First Step', description:'Open five MedMinute resources.', test:s => s.viewCount >= 5},
    {id:'health-explorer', icon:'🩺', title:'Health Explorer', description:'Open ten health articles.', test:s => s.healthViews >= 10},
    {id:'clinical-explorer', icon:'🏥', title:'Clinical Explorer', description:'Explore ten clinical skills.', test:s => s.clinicalCount >= 10},
    {id:'case-investigator', icon:'🔎', title:'Case Investigator', description:'Complete ten case challenges.', test:s => s.caseCount >= 10},
    {id:'biology-master', icon:'🧬', title:'Biology Master', description:'Score 80% or higher on the Biology 20 final exam.', test:s => s.bioScore >= 80},
    {id:'chemistry-master', icon:'⚗️', title:'Chemistry Master', description:'Score 80% or higher on the Chemistry 30 final exam.', test:s => s.chemScore >= 80},
    {id:'thirty-day-scholar', icon:'🏆', title:'Thirty-Day Scholar', description:'Complete the full MedMinute Challenge.', test:s => s.challengeCount >= 30},
    {id:'ai-tutor-scholar', icon:'🤖', title:'AI Tutor Scholar', description:'Complete three AI Tutor mastery attempts.', test:s => s.tutorAttempts >= 3},
    {id:'animation-explorer', icon:'🎞️', title:'Animation Explorer', description:'Open the Biology Animations learning centre.', test:s => s.animationViewed},
    {id:'well-rounded', icon:'🌟', title:'Well-Rounded Learner', description:'Earn five other achievements.', test:s => s.baseUnlocked >= 5}
  ];

  function safeJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch(e) { return fallback; }
  }
  function titleFromPage() {
    return document.querySelector('h1')?.textContent.trim() || document.title.split('|')[0].trim();
  }
  function currentCategory() {
    const path = location.pathname.split('/').pop() || 'index.html';
    if (path.startsWith('specialty-')) return 'Careers';
    if (['health-library.html','dictionary.html','symptom-explorer.html','anatomy.html','learn.html'].includes(path)) return 'Learn';
    if (['academy.html','biology.html','chemistry.html','final-exams.html','cases.html','challenge.html','biology-animations.html'].includes(path)) return 'Study';
    if (['clinical-skills.html','calculators.html'].includes(path)) return 'Clinical';
    if (['ai-assistant.html','ai-tutor.html'].includes(path)) return 'AI';
    if (path.endsWith('.html') && !['index.html','founder.html','about.html','contact.html','dashboard.html','opportunities.html'].includes(path)) return 'Health Article';
    return 'General';
  }

  // Track page views and recent resources
  const path = location.pathname.split('/').pop() || 'index.html';
  const views = safeJSON(STORAGE.views, {});
  views[path] = {count:(views[path]?.count || 0)+1, title:titleFromPage(), category:currentCategory(), last:new Date().toISOString()};
  localStorage.setItem(STORAGE.views, JSON.stringify(views));
  let recent = safeJSON(STORAGE.recent, []);
  recent = [{url:path,title:titleFromPage(),category:currentCategory()}, ...recent.filter(x => x.url !== path)].slice(0,8);
  localStorage.setItem(STORAGE.recent, JSON.stringify(recent));

  // Track clinical skill selections
  document.querySelectorAll('.skill-select').forEach(button => {
    button.addEventListener('click', () => {
      const viewed = new Set(safeJSON(STORAGE.clinical, []));
      viewed.add(button.dataset.skill || button.textContent.trim());
      localStorage.setItem(STORAGE.clinical, JSON.stringify([...viewed]));
      updateAchievements();
    });
  });

  // Track case completion
  document.querySelectorAll('.check-case').forEach(button => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        const card = button.closest('.case-card');
        if (card?.dataset.answered === 'true') {
          const completed = new Set(safeJSON(STORAGE.cases, []));
          completed.add(card.dataset.case || String([...document.querySelectorAll('.case-card')].indexOf(card)));
          localStorage.setItem(STORAGE.cases, JSON.stringify([...completed]));
          updateAchievements();
        }
      }, 50);
    });
  });

  function tutorAttempts() {
    const mastery = safeJSON('medminuteTutorMastery', {});
    return Object.values(mastery).reduce((sum,item) => sum + Number(item.attempts || 0), 0);
  }
  function state() {
    const allViews = Object.values(safeJSON(STORAGE.views, {}));
    const currentUnlocked = safeJSON(STORAGE.achievements, []);
    return {
      viewCount: allViews.length,
      healthViews: allViews.filter(v => v.category === 'Health Article').length,
      clinicalCount: safeJSON(STORAGE.clinical, []).length,
      caseCount: safeJSON(STORAGE.cases, []).length,
      bioScore: Number(localStorage.getItem('medminute_bio_score') || 0),
      chemScore: Number(localStorage.getItem('medminute_chem_score') || 0),
      challengeCount: safeJSON('medminuteChallengeProgress', []).length,
      tutorAttempts: tutorAttempts(),
      animationViewed: Boolean(views['biology-animations.html']),
      baseUnlocked: currentUnlocked.filter(x => x !== 'well-rounded').length
    };
  }
  function updateAchievements() {
    const s = state();
    let unlocked = new Set(safeJSON(STORAGE.achievements, []));
    achievements.forEach(a => {
      const evaluationState = {...s, baseUnlocked:[...unlocked].filter(x => x !== 'well-rounded').length};
      if (a.test(evaluationState)) unlocked.add(a.id);
    });
    localStorage.setItem(STORAGE.achievements, JSON.stringify([...unlocked]));
    renderAchievements();
  }
  function renderAchievements() {
    const target = document.getElementById('dashboardAchievements');
    if (!target) return;
    const unlocked = new Set(safeJSON(STORAGE.achievements, []));
    target.innerHTML = achievements.map(a => `
      <article class="auto-achievement ${unlocked.has(a.id)?'unlocked':''}">
        <div class="auto-achievement-icon">${a.icon}</div>
        <h3>${a.title}</h3><p>${a.description}</p>
        <span class="auto-achievement-status">${unlocked.has(a.id)?'Unlocked':'In progress'}</span>
      </article>`).join('');
  }

  // Dashboard
  function fillDashboard() {
    if (!document.getElementById('dashboardAchievements')) return;
    const s = state();
    const setText = (id,value) => {const el=document.getElementById(id);if(el)el.textContent=value;};
    setText('dashArticles',s.viewCount);
    setText('dashCases',s.caseCount);
    setText('dashChallenge',`${Math.round(s.challengeCount/30*100)}%`);
    setText('dashAchievements',safeJSON(STORAGE.achievements, []).length);
    setText('dashStreak',localStorage.getItem('medminuteStreak') || '1');

    [['Bio',s.bioScore],['Chem',s.chemScore]].forEach(([name,score]) => {
      const label=document.getElementById(`dash${name}Label`);
      const bar=document.getElementById(`dash${name}Bar`);
      if(label)label.textContent=score?`${score}%`:'Not attempted';
      if(bar)bar.style.width=`${score}%`;
    });

    const mastery = Object.values(safeJSON('medminuteTutorMastery', {})).sort((a,b)=>a.average-b.average).slice(0,6);
    const masteryList=document.getElementById('dashMasteryList');
    if(masteryList) masteryList.innerHTML=mastery.length ? mastery.map(item => `
      <div class="dashboard-progress-item"><div><strong>${item.topic}</strong><span>${item.average}%</span></div>
      <div class="progress-track"><span style="width:${item.average}%"></span></div></div>`).join('') :
      '<div class="notice" style="margin-top:20px">Complete an AI Tutor quiz to begin building topic mastery.</div>';

    const recommendations=[];
    if(!s.bioScore) recommendations.push({title:'Take the Biology 20 final exam',url:'final-exams.html'});
    else if(s.bioScore<80) recommendations.push({title:'Review Biology 20 and retake the exam',url:'academy.html'});
    if(!s.chemScore) recommendations.push({title:'Take the Chemistry 30 final exam',url:'final-exams.html'});
    else if(s.chemScore<80) recommendations.push({title:'Review Chemistry 30 diploma preparation',url:'academy.html'});
    if(s.challengeCount<30) recommendations.push({title:`Continue the 30-Day Challenge (${s.challengeCount}/30)`,url:'challenge.html'});
    if(s.clinicalCount<10) recommendations.push({title:'Explore the Clinical Skills Library',url:'clinical-skills.html'});
    if(s.tutorAttempts<3) recommendations.push({title:'Complete an AI Tutor quiz',url:'ai-tutor.html'});
    const recommendationBox=document.getElementById('dashboardRecommendations');
    if(recommendationBox) recommendationBox.innerHTML=recommendations.slice(0,5).map(r =>
      `<a class="recommendation-item" href="${r.url}"><strong>${r.title}</strong><p>Open this MedMinute activity.</p></a>`
    ).join('');

    const recentBox=document.getElementById('recentlyViewedList');
    if(recentBox) recentBox.innerHTML=safeJSON(STORAGE.recent, []).map(r =>
      `<a class="recent-item" href="${r.url}"><strong>${r.title}</strong><br><span class="small">${r.category}</span></a>`
    ).join('') || '<p class="small">No recent resources yet.</p>';
  }

  // Final exam review mode and per-unit report
  document.querySelectorAll('.exam-submit').forEach(button => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        const exam = document.getElementById(`${button.dataset.exam}Exam`);
        if (!exam || exam.querySelectorAll('.exam-question input:checked').length !== exam.querySelectorAll('.exam-question').length) return;
        const questions=[...exam.querySelectorAll('.exam-question')];
        const unitStats={};
        questions.forEach(question => {
          const selected=Number(question.querySelector('input:checked').value);
          const correct=Number(question.dataset.correct);
          const unit=question.dataset.unit || 'Course Review';
          unitStats[unit] ||= {correct:0,total:0};
          unitStats[unit].total++;
          if(selected===correct){unitStats[unit].correct++;question.classList.add('review-correct');}
          else question.classList.add('review-incorrect');
          question.querySelectorAll('input').forEach(input => input.disabled=true);
          const explanation=question.querySelector('.exam-review-explanation');
          if(explanation) explanation.style.display='block';
        });
        const result=document.getElementById(`${button.dataset.exam}Result`);
        if(result && !result.querySelector('.exam-review-summary')){
          result.insertAdjacentHTML('beforeend', `<div class="exam-review-summary"><h3>Review by unit</h3>${
            Object.entries(unitStats).map(([unit,data]) =>
              `<div class="exam-review-unit"><strong>${unit}:</strong> ${data.correct}/${data.total}</div>`
            ).join('')
          }<p style="margin-top:14px">Every question is now marked and includes a short review explanation below it.</p></div>`);
        }
        updateAchievements();
      },100);
    });
  });

  // Accessibility controls
  const savedA11y=safeJSON(STORAGE.accessibility,{font:'normal',motion:false,contrast:false});
  function applyA11y(){
    document.documentElement.classList.toggle('font-large',savedA11y.font==='large');
    document.documentElement.classList.toggle('font-small',savedA11y.font==='small');
    document.body.classList.toggle('reduce-motion',Boolean(savedA11y.motion));
    document.body.classList.toggle('high-contrast',Boolean(savedA11y.contrast));
    localStorage.setItem(STORAGE.accessibility,JSON.stringify(savedA11y));
  }
  const launcher=document.getElementById('accessibilityToggle');
  const panel=document.getElementById('accessibilityPanel');
  launcher?.addEventListener('click',()=>panel?.classList.toggle('open'));
  document.querySelectorAll('[data-accessibility]').forEach(button=>{
    button.addEventListener('click',()=>{
      const action=button.dataset.accessibility;
      if(action==='font-up') savedA11y.font='large';
      if(action==='font-down') savedA11y.font=savedA11y.font==='large'?'normal':'small';
      if(action==='motion') savedA11y.motion=!savedA11y.motion;
      if(action==='contrast') savedA11y.contrast=!savedA11y.contrast;
      applyA11y();
    });
  });
  document.getElementById('dashboardFontIncrease')?.addEventListener('click',()=>{savedA11y.font='large';applyA11y();});
  document.getElementById('dashboardFontDecrease')?.addEventListener('click',()=>{savedA11y.font=savedA11y.font==='large'?'normal':'small';applyA11y();});
  document.getElementById('dashboardMotionToggle')?.addEventListener('click',()=>{savedA11y.motion=!savedA11y.motion;applyA11y();});
  applyA11y();

  updateAchievements();
  fillDashboard();
});

// MedMinute 4.0 premium interactions
document.addEventListener('DOMContentLoaded', () => {
  // Smooth internal page transitions
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || link.target === '_blank') return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => location.href = link.href, 160);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', event => {
    if (event.target.matches('input,textarea,select') || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === '/') { event.preventDefault(); document.getElementById('globalSearchButton')?.click(); }
    if (event.key.toLowerCase() === 'd') location.href = 'dictionary.html';
    if (event.key.toLowerCase() === 'a') location.href = 'ai-tutor.html';
  });

  // Continue where left off
  try {
    const recent = JSON.parse(localStorage.getItem('medminuteRecentPages') || '[]')
      .filter(item => item.url && !['index.html','dashboard.html'].includes(item.url));
    const item = recent[0];
    if (item) {
      const title = document.getElementById('continueLearningTitle');
      const desc = document.getElementById('continueLearningDescription');
      const link = document.getElementById('continueLearningLink');
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = `Continue your most recently viewed ${item.category || 'learning'} resource.`;
      if (link) link.href = item.url;
    }
  } catch(e) {}

  // Premium layered anatomy
  const humanModel = document.getElementById('humanModel');
  const rotation = document.getElementById('anatomyRotation');
  rotation?.addEventListener('input', () => {
    humanModel.style.transform = `rotateY(${rotation.value}deg) rotateX(1deg)`;
  });
  const bodyScene = document.querySelector('.human-model-scene');
  document.querySelectorAll('.anatomy-layer').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.anatomy-layer').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      bodyScene.classList.remove('anatomy-mode-exterior','anatomy-mode-skeleton','anatomy-mode-muscles');
      if (button.dataset.layer === 'exterior') bodyScene.classList.add('anatomy-mode-exterior');
      if (button.dataset.layer === 'skeleton') bodyScene.classList.add('anatomy-mode-skeleton');
      if (button.dataset.layer === 'muscles') bodyScene.classList.add('anatomy-mode-muscles');
    });
  });
  const organButtons = [...document.querySelectorAll('.human-model .organ-button')];
  const organPanels = [...document.querySelectorAll('.anatomy-detail-panel')];
  organButtons.forEach(button => button.addEventListener('click', () => {
    organButtons.forEach(b => b.classList.remove('active'));
    organPanels.forEach(p => p.classList.remove('active'));
    document.querySelectorAll(`.organ-button[data-organ="${button.dataset.organ}"]`).forEach(b=>b.classList.add('active'));
    const panel = organPanels.find(p => p.dataset.anatomyPanel === button.dataset.organ);
    panel?.classList.add('active');
    if (innerWidth < 980) panel?.scrollIntoView({behavior:'smooth',block:'start'});
  }));

  // Speech synthesis for AI tutor and article text
  let speaking = null;
  function speakText(text, button) {
    if (!('speechSynthesis' in window)) { alert('Speech playback is not supported in this browser.'); return; }
    speechSynthesis.cancel();
    if (speaking === button) { speaking = null; button.textContent = '🔊 Read aloud'; return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98; utterance.pitch = 1;
    utterance.onend = () => { speaking = null; button.textContent = button.dataset.original || '🔊 Read aloud'; };
    button.dataset.original ||= button.textContent;
    button.textContent = '■ Stop voice';
    speaking = button;
    speechSynthesis.speak(utterance);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('.article-read-button,.tutor-speak-button');
    if (!button) return;
    const target = button.classList.contains('article-read-button')
      ? button.closest('.article-content')
      : button.closest('.tutor-content,.ai-bubble');
    if (target) speakText(target.innerText.replace(button.innerText,''), button);
  });
  // Add voice button when tutor content changes.
  const tutorActivity = document.getElementById('tutorActivity');
  if (tutorActivity) {
    new MutationObserver(() => {
      tutorActivity.querySelectorAll('.tutor-content').forEach(content => {
        if (!content.querySelector('.tutor-speak-button')) {
          const b = document.createElement('button');
          b.className='voice-button tutor-speak-button'; b.type='button'; b.textContent='🔊 Listen to this lesson';
          content.prepend(b);
        }
      });
    }).observe(tutorActivity,{childList:true,subtree:true});
  }

  // Medical image upload and explanation
  const imageInput=document.getElementById('medicalImageInput');
  const imageDrop=document.getElementById('imageDropZone');
  const imagePreview=document.getElementById('medicalImagePreview');
  let medicalImageData='';
  function processImage(file){
    if(!file) return;
    if(file.size > 8*1024*1024){alert('Please choose an image smaller than 8 MB.');return;}
    const reader=new FileReader();
    reader.onload=()=>{medicalImageData=reader.result;imagePreview.src=medicalImageData;imageDrop.classList.add('has-image');};
    reader.readAsDataURL(file);
  }
  imageInput?.addEventListener('change',()=>processImage(imageInput.files[0]));
  imageDrop?.addEventListener('dragover',e=>{e.preventDefault();imageDrop.style.borderColor='var(--maroon)';});
  imageDrop?.addEventListener('dragleave',()=>imageDrop.style.borderColor='');
  imageDrop?.addEventListener('drop',e=>{e.preventDefault();imageDrop.style.borderColor='';processImage(e.dataTransfer.files[0]);});
  document.getElementById('explainMedicalImage')?.addEventListener('click',async()=>{
    const question=document.getElementById('imageQuestion').value.trim();
    const consent=document.getElementById('imageConsent').checked;
    const empty=document.getElementById('imageExplainerEmpty'),skeleton=document.getElementById('imageExplainerSkeleton'),result=document.getElementById('imageExplainerResult');
    if(!medicalImageData){alert('Select an image first.');return;}
    if(!consent){alert('Confirm that the image is de-identified and educational.');return;}
    empty.hidden=true;skeleton.hidden=false;result.hidden=true;
    try{
      const response=await fetch('/api/image-explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:medicalImageData,question})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Unable to explain image.');
      result.innerHTML=`<span class="eyebrow">Educational explanation</span><h2>${data.title||'Image explanation'}</h2><p>${(data.explanation||'').replace(/\n/g,'</p><p>')}</p><div class="notice"><strong>Limitations:</strong> ${data.limitations||'This is not a clinical diagnosis.'}</div>`;
      result.hidden=false;
    }catch(error){
      result.innerHTML=`<div class="warning"><strong>Image explainer is not connected.</strong><p>${error.message}</p><p>Start the included server and configure the OpenAI API environment variables.</p></div>`;
      result.hidden=false;
    }finally{skeleton.hidden=true;}
  });

  // Certificate system
  const certProgram=document.getElementById('certificateProgram');
  const certName=document.getElementById('certificateName');
  const certEligibility=document.getElementById('certificateEligibility');
  const generateCert=document.getElementById('generateCertificate');
  const dlCert=document.getElementById('downloadCertificateSVG');
  const printCert=document.getElementById('printCertificate');
  function certStatus(){
    if(!certProgram) return {eligible:false};
    const value=certProgram.value;
    const bio=Number(localStorage.getItem('medminute_bio_score')||0);
    const chem=Number(localStorage.getItem('medminute_chem_score')||0);
    let mastery={};try{mastery=JSON.parse(localStorage.getItem('medminuteTutorMastery')||'{}')}catch(e){}
    const attempts=Object.values(mastery).reduce((s,x)=>s+Number(x.attempts||0),0);
    let data={biology:{eligible:bio>=80,label:'Alberta Biology 20',detail:`Final exam score: ${bio}%`,requirement:'Score at least 80% on the Biology 20 final exam.'},
      chemistry:{eligible:chem>=80,label:'Alberta Chemistry 30',detail:`Final exam score: ${chem}%`,requirement:'Score at least 80% on the Chemistry 30 final exam.'},
      challenge:{eligible:(JSON.parse(localStorage.getItem('medminuteChallengeProgress')||'[]').length>=30),label:'30-Day MedMinute Challenge',detail:'All 30 learning days completed.',requirement:'Complete all 30 challenge days.'},
      ai:{eligible:attempts>=3,label:'MedMinute AI Tutor Scholar',detail:`AI Tutor mastery attempts: ${attempts}`,requirement:'Complete at least three AI Tutor mastery attempts.'}}[value];
    return data;
  }
  function updateCertEligibility(){if(!certEligibility)return;const s=certStatus();certEligibility.className=s.eligible?'success':'notice';certEligibility.innerHTML=`<strong>${s.eligible?'Eligible':'Not yet eligible'}</strong><p>${s.eligible?s.detail:s.requirement}</p>`;}
  certProgram?.addEventListener('change',updateCertEligibility);updateCertEligibility();
  generateCert?.addEventListener('click',()=>{
    const status=certStatus(),name=certName.value.trim();
    if(!name){alert('Enter the learner name.');return;}if(!status.eligible){alert(status.requirement);return;}
    document.getElementById('certificatePreviewName').textContent=name;
    document.getElementById('certificatePreviewProgram').textContent=status.label;
    document.getElementById('certificatePreviewDetail').textContent=status.detail;
    const date=new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
    document.getElementById('certificateDate').textContent=date;
    document.getElementById('certificateId').textContent=`Certificate ID: MM-${Date.now().toString(36).toUpperCase()}`;
    dlCert.disabled=false;printCert.disabled=false;
  });
  dlCert?.addEventListener('click',()=>{
    const paper=document.getElementById('certificatePreview');
    const name=document.getElementById('certificatePreviewName').textContent;
    const program=document.getElementById('certificatePreviewProgram').textContent;
    const detail=document.getElementById('certificatePreviewDetail').textContent;
    const date=document.getElementById('certificateDate').textContent;
    const id=document.getElementById('certificateId').textContent;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990"><rect width="100%" height="100%" fill="#fff"/><rect x="35" y="35" width="1330" height="920" fill="#fbf6f7" stroke="#8A1538" stroke-width="14"/><rect x="55" y="55" width="1290" height="880" fill="none" stroke="#0A2F5A" stroke-width="3"/><text x="700" y="140" text-anchor="middle" font-family="Arial" font-size="42" font-weight="bold" fill="#8A1538">MEDMINUTE</text><text x="700" y="205" text-anchor="middle" font-family="Arial" font-size="25" letter-spacing="8" fill="#0A2F5A">CERTIFICATE OF COMPLETION</text><text x="700" y="310" text-anchor="middle" font-family="Georgia" font-size="34" fill="#25364a">This certificate is proudly presented to</text><text x="700" y="410" text-anchor="middle" font-family="Georgia" font-size="70" fill="#8A1538">${name.replace(/[&<>]/g,'')}</text><line x1="260" y1="435" x2="1140" y2="435" stroke="#caa25e" stroke-width="3"/><text x="700" y="510" text-anchor="middle" font-family="Georgia" font-size="29" fill="#25364a">for successfully completing</text><text x="700" y="600" text-anchor="middle" font-family="Georgia" font-size="52" font-weight="bold" fill="#0A2F5A">${program.replace(/[&<>]/g,'')}</text><text x="700" y="665" text-anchor="middle" font-family="Arial" font-size="25" fill="#495769">${detail.replace(/[&<>]/g,'')}</text><line x1="210" y1="810" x2="510" y2="810" stroke="#555"/><text x="360" y="842" text-anchor="middle" font-family="Arial" font-size="25" fill="#25364a">Saad Aboumalik</text><text x="360" y="870" text-anchor="middle" font-family="Arial" font-size="18" fill="#697586">Founder, MedMinute</text><line x1="890" y1="810" x2="1190" y2="810" stroke="#555"/><text x="1040" y="842" text-anchor="middle" font-family="Arial" font-size="25" fill="#25364a">${date}</text><text x="1040" y="870" text-anchor="middle" font-family="Arial" font-size="18" fill="#697586">Date issued</text><text x="700" y="925" text-anchor="middle" font-family="Arial" font-size="16" fill="#697586">${id}</text></svg>`;
    const blob=new Blob([svg],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`MedMinute-${program.replace(/\s+/g,'-')}-Certificate.svg`;a.click();URL.revokeObjectURL(url);
  });
  printCert?.addEventListener('click',()=>window.print());
});

// MedMinute 4.1 anonymous live impact analytics
document.addEventListener('DOMContentLoaded', () => {
  const visitorKey = 'medminuteAnonymousVisitor';
  let visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = `mm_${window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2)}`;
    localStorage.setItem(visitorKey, visitorId);
  }

  const currentUrl = location.pathname.split('/').pop() || 'index.html';
  const currentTitle = document.querySelector('h1')?.textContent.trim() || document.title.split('|')[0].trim();

  async function trackImpact(event, details = {}) {
    try {
      await fetch('/api/analytics/event', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({visitor_id:visitorId,event,url:details.url || currentUrl,title:details.title || currentTitle})
      });
    } catch (_) {
      // Static previews remain fully usable when the analytics server is not running.
    }
  }
  window.medminuteTrackImpact = trackImpact;
  trackImpact('page_view');

  // Count an article read after meaningful engagement rather than an immediate open.
  if (document.querySelector('.article-content')) {
    const readKey = `medminuteRead_${currentUrl}`;
    let engaged = Boolean(sessionStorage.getItem(readKey));
    const qualify = () => {
      if (engaged || sessionStorage.getItem(readKey)) return;
      const maxScroll = document.documentElement.scrollHeight - innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 1;
      if (progress >= .45) {
        engaged = true;
        sessionStorage.setItem(readKey,'1');
        trackImpact('article_read');
        removeEventListener('scroll', qualify);
      }
    };
    addEventListener('scroll', qualify, {passive:true});
    setTimeout(() => {
      if (!engaged && document.visibilityState === 'visible') {
        engaged = true; sessionStorage.setItem(readKey,'1'); trackImpact('article_read');
      }
    }, 45000);
  }

  // Instrument user-completion actions.
  document.querySelectorAll('.exam-submit').forEach(button =>
    button.addEventListener('click', () => setTimeout(() => trackImpact('quiz_completed'), 250))
  );
  document.querySelectorAll('.check-case').forEach(button =>
    button.addEventListener('click', () => setTimeout(() => {
      if (button.closest('.case-card')?.dataset.answered === 'true') trackImpact('case_completed');
    }, 120))
  );
  // Certificate analytics are deduplicated in the MedMinute 4.1 instrumentation block.
  document.getElementById('runTutor')?.addEventListener('click', () => trackImpact('ai_tutor_use'));
  document.getElementById('askAIButton')?.addEventListener('click', () => trackImpact('ai_question'));
  document.getElementById('explainMedicalImage')?.addEventListener('click', () => trackImpact('image_explanation'));

  // Live public impact dashboard.
  const impactContent = document.getElementById('impactDashboardContent');
  if (impactContent) {
    const fmt = value => new Intl.NumberFormat().format(Number(value || 0));
    const set = (id,value) => {const el=document.getElementById(id);if(el)el.textContent=value;};

    function renderImpact(data) {
      const totals = data.totals || {};
      set('impactVisitors',fmt(data.total_visitors));
      set('impactActive',fmt(data.active_now));
      set('impactPageViews',fmt(totals.page_views));
      set('impactArticleReads',fmt(totals.article_reads));
      set('impactAIUses',fmt(totals.ai_tutor_uses));
      set('impactAIQuestions',fmt(totals.ai_questions));
      set('impactCertificates',fmt(totals.certificates_earned));
      set('impactQuizzes',fmt(totals.quizzes_completed));
      const updated = data.updated_at ? new Date(data.updated_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}) : 'just now';
      set('impactUpdated',`Live data updated ${updated}`);

      const top = document.getElementById('impactTopPages');
      if (top) {
        top.innerHTML = data.top_pages?.length ? data.top_pages.map((item,index) => `
          <a class="impact-rank-item" href="${encodeURI(item.url)}">
            <span class="impact-rank-number">${index+1}</span>
            <span><strong>${String(item.title).replace(/[<>]/g,'')}</strong><small>${fmt(item.views)} views · ${fmt(item.reads)} reads</small></span>
            <span class="impact-rank-value">${fmt((item.views||0)+(item.reads||0))}</span>
          </a>`).join('') :
          '<div class="premium-empty-state"><strong>No public usage yet.</strong><p>Popular resources will appear once the hosted website receives visitors.</p></div>';
      }

      const trend = document.getElementById('impactTrend');
      if (trend) {
        const days = data.daily || [];
        const values = days.map(day => Object.values(day).filter(v => typeof v === 'number').reduce((a,b)=>a+b,0));
        const max = Math.max(1,...values);
        trend.innerHTML = days.length ? days.map((day,index) => {
          const value=values[index],height=Math.max(4,Math.round(value/max*190));
          return `<div class="impact-day" title="${day.date}: ${value} events"><div class="impact-bar" style="height:${height}px"></div><span>${day.date.slice(5)}</span></div>`;
        }).join('') :
        '<div class="premium-empty-state" style="width:100%"><strong>Activity trend will appear here.</strong><p>The graph begins when the hosted platform receives its first events.</p></div>';
      }
      document.getElementById('impactDashboardSkeleton')?.setAttribute('hidden','');
      impactContent.hidden = false;
    }

    async function refreshImpact() {
      try {
        const response = await fetch('/api/analytics/summary',{cache:'no-store'});
        if (!response.ok) throw new Error();
        renderImpact(await response.json());
      } catch {
        document.getElementById('impactDashboardSkeleton')?.setAttribute('hidden','');
        impactContent.hidden=false;
        set('impactUpdated','Live server not connected — start the included Node server');
      }
    }
    refreshImpact();
    setInterval(refreshImpact,15000);
  }
});

// MedMinute 4.1 homepage live metrics and analytics instrumentation fixes
document.addEventListener('DOMContentLoaded', () => {
  const homeLiveVisitors=document.getElementById('homeLiveVisitors');
  if(homeLiveVisitors){
    const fmt=n=>new Intl.NumberFormat().format(Number(n||0));
    const refresh=async()=>{
      try{
        const response=await fetch('/api/analytics/summary',{cache:'no-store'});
        if(!response.ok)throw new Error();
        const data=await response.json(),t=data.totals||{};
        homeLiveVisitors.textContent=fmt(data.total_visitors);
        document.getElementById('homeLiveReads').textContent=fmt(t.article_reads);
        document.getElementById('homeLiveAI').textContent=fmt(t.ai_tutor_uses);
        document.getElementById('homeLiveCertificates').textContent=fmt(t.certificates_earned);
      }catch{
        homeLiveVisitors.textContent='Live';
        document.getElementById('homeLiveReads').textContent='Server';
        document.getElementById('homeLiveAI').textContent='Required';
        document.getElementById('homeLiveCertificates').textContent='—';
      }
    };
    refresh();setInterval(refresh,30000);
  }

  // Generated quizzes are inserted after page load, so use delegated tracking.
  document.addEventListener('click',event=>{
    if(event.target.closest('#submitGeneratedQuiz')) setTimeout(()=>window.medminuteTrackImpact?.('quiz_completed'),300);
  });

  // Count each certificate program once per anonymous browser.
  document.getElementById('generateCertificate')?.addEventListener('click',()=>{
    setTimeout(()=>{
      const download=document.getElementById('downloadCertificateSVG');
      const program=document.getElementById('certificateProgram')?.value;
      if(!download?.disabled&&program){
        const key=`medminuteCertificateTracked_${program}`;
        if(!localStorage.getItem(key)){
          localStorage.setItem(key,'1');
          window.medminuteTrackImpact?.('certificate_earned');
        }
      }
    },140);
  });
});

// MedMinute 4.2 Interactive 30-Day Challenge Mode
document.addEventListener('DOMContentLoaded', () => {
  const root=document.getElementById('challengeChapterList');
  if(!root) return;

  const challenges=[{"day": 1, "chapter": "Medical Foundations", "title": "Thyroid Detective", "subtitle": "Hormones, feedback and energy", "lesson": "The thyroid gland releases T4 and T3 under stimulation from pituitary TSH. In primary hypothyroidism, the thyroid underproduces hormone, so the pituitary commonly responds by increasing TSH. Low thyroid hormone can slow metabolism and contribute to fatigue, cold intolerance and reduced concentration.", "type": "mcq", "question": "Which laboratory pattern most strongly suggests primary hypothyroidism?", "options": ["Low TSH and high free T4", "High TSH and low free T4", "Normal TSH and high free T4", "High TSH and high free T4"], "correct": 1, "explanation": "When the thyroid underproduces hormone, free T4 falls and pituitary TSH commonly rises in an attempt to stimulate it.", "reflection": "How can a hormone disorder affect several apparently unrelated parts of daily life?"}, {"day": 2, "chapter": "Medical Foundations", "title": "Vital Signs First", "subtitle": "Recognize the basic observations", "lesson": "Vital signs provide a rapid picture of physiological stability. Heart rate reflects pulse frequency, respiratory rate counts breaths, blood pressure estimates arterial pressure, temperature helps identify fever or hypothermia, and oxygen saturation estimates hemoglobin oxygenation.", "type": "matching", "question": "Match each value to the correct vital sign.", "pairs": [["98%", "Oxygen saturation"], ["118/74 mmHg", "Blood pressure"], ["16 breaths/min", "Respiratory rate"], ["72 beats/min", "Heart rate"]], "reflection": "Why should vital signs be interpreted together rather than one at a time?"}, {"day": 3, "chapter": "Medical Foundations", "title": "Homeostasis in Action", "subtitle": "Negative feedback", "lesson": "Homeostasis maintains internal conditions within a functional range. In negative feedback, a change is detected and responses oppose that change. Examples include insulin lowering elevated blood glucose and sweating helping reduce elevated body temperature.", "type": "mcq", "question": "Which example best represents negative feedback?", "options": ["Labor contractions becoming progressively stronger", "Platelets attracting more platelets to a wound", "Sweating when body temperature rises", "A neuron reaching threshold and firing"], "correct": 2, "explanation": "Sweating opposes the original rise in body temperature and helps return the body toward its normal range.", "reflection": "Give one other example of the body correcting a change."}, {"day": 4, "chapter": "Medical Foundations", "title": "Medical Language Builder", "subtitle": "Decode common terms", "lesson": "Medical terms often combine prefixes, roots and suffixes. Tachy- means fast, brady- means slow, cardio refers to the heart, neuro refers to nerves, and -itis means inflammation.", "type": "matching", "question": "Match each term to its meaning.", "pairs": [["Tachycardia", "Fast heart rate"], ["Bradycardia", "Slow heart rate"], ["Dermatitis", "Inflammation of the skin"], ["Neurology", "Study of the nervous system"]], "reflection": "How can word roots help you understand an unfamiliar medical term?"}, {"day": 5, "chapter": "Medical Foundations", "title": "Checkpoint: The Unwell Student", "subtitle": "Combine foundations", "lesson": "A good first assessment begins with safety, vital signs, focused symptoms and appropriate escalation. Medical reasoning is not only naming a disease; it is identifying what matters first.", "type": "multi", "question": "A student feels faint, looks pale and is breathing rapidly. Which THREE actions are most appropriate first?", "options": ["Check responsiveness and vital signs", "Ask them to continue exercising", "Ensure a safe seated or lying position", "Seek qualified help if symptoms persist or worsen", "Give an unknown medication"], "correct": [0, 2, 3], "explanation": "Immediate safety, basic assessment and appropriate escalation come before speculation or treatment.", "reflection": "What is the difference between recognizing danger and diagnosing a disease?", "checkpoint": true}, {"day": 6, "chapter": "Heart and Circulation", "title": "Follow the Blood", "subtitle": "Pulmonary and systemic circulation", "lesson": "Deoxygenated blood returns to the right atrium, enters the right ventricle and travels through the pulmonary artery to the lungs. Oxygenated blood returns through pulmonary veins to the left atrium, enters the left ventricle and is pumped through the aorta to the body.", "type": "sequence", "question": "Place the structures in the correct order beginning with the right atrium.", "items": ["Right atrium", "Right ventricle", "Pulmonary artery", "Lungs", "Pulmonary veins", "Left atrium", "Left ventricle", "Aorta"], "reflection": "Why is the left ventricular wall thicker than the right ventricular wall?"}, {"day": 7, "chapter": "Heart and Circulation", "title": "Blood Pressure Technique", "subtitle": "Accuracy matters", "lesson": "For an accurate resting blood-pressure reading, the person should sit quietly with back supported, feet flat, legs uncrossed and the arm supported near heart level. The cuff must fit correctly, and talking can alter the result.", "type": "multi", "question": "Select all features of a good blood-pressure measurement.", "options": ["Correct cuff size", "Arm unsupported below the waist", "Five minutes of quiet rest", "Talking throughout the measurement", "Feet flat on the floor"], "correct": [0, 2, 4], "explanation": "Cuff size, quiet rest and correct posture improve accuracy. An unsupported arm and talking can distort the reading.", "reflection": "Why can one inaccurate reading lead to unnecessary concern?"}, {"day": 8, "chapter": "Heart and Circulation", "title": "ECG Foundations", "subtitle": "Electrical activity", "lesson": "A normal ECG represents cardiac electrical activity. The P wave reflects atrial depolarization, the QRS complex reflects ventricular depolarization and the T wave reflects ventricular repolarization.", "type": "matching", "question": "Match each ECG component to its meaning.", "pairs": [["P wave", "Atrial depolarization"], ["QRS complex", "Ventricular depolarization"], ["T wave", "Ventricular repolarization"], ["PR interval", "Conduction from atria through the AV region"]], "reflection": "Why does an ECG show electrical activity rather than the heart's physical shape?"}, {"day": 9, "chapter": "Heart and Circulation", "title": "Heart Attack Warning Signs", "subtitle": "Recognize an emergency", "lesson": "A heart attack may cause chest pressure, pain spreading to an arm or jaw, sweating, nausea, breathlessness or unusual weakness. Symptoms can vary. Suspected heart attack requires urgent emergency assessment.", "type": "mcq", "question": "What is the safest response to new severe chest pressure with sweating and shortness of breath?", "options": ["Wait until the next day", "Continue normal activity", "Seek emergency help immediately", "Take someone else's medication"], "correct": 2, "explanation": "Possible heart-attack symptoms require emergency help. Delay can increase heart-muscle damage.", "reflection": "Why should emergency recognition be taught even to people who cannot diagnose?"}, {"day": 10, "chapter": "Heart and Circulation", "title": "Checkpoint: Chest Pain Pathway", "subtitle": "Choose the next step", "lesson": "In acute chest pain, the priority is identifying life-threatening causes. Initial assessment commonly includes vital signs, a focused history, ECG and appropriate emergency escalation. A normal appearance does not automatically exclude danger.", "type": "multi", "question": "A 54-year-old develops central chest pressure. Which THREE steps belong in an appropriate initial pathway?", "options": ["Obtain an ECG", "Assess vital signs", "Ignore symptoms if pain improves briefly", "Activate urgent medical evaluation", "Schedule a routine dental visit"], "correct": [0, 1, 3], "explanation": "ECG, vital signs and urgent assessment are appropriate early steps for potentially serious chest pain.", "reflection": "What finding would make you most concerned in a chest-pain scenario?", "checkpoint": true}, {"day": 11, "chapter": "Brain and Nervous System", "title": "Stroke FAST", "subtitle": "Time-sensitive recognition", "lesson": "FAST stands for Face drooping, Arm weakness, Speech difficulty and Time to call emergency services. Sudden vision loss, imbalance, numbness or severe headache can also occur.", "type": "matching", "question": "Match each FAST letter to its action or sign.", "pairs": [["F", "Face drooping"], ["A", "Arm weakness"], ["S", "Speech difficulty"], ["T", "Time to call emergency services"]], "reflection": "Why is the time symptoms began clinically important?"}, {"day": 12, "chapter": "Brain and Nervous System", "title": "Stroke or TIA?", "subtitle": "Symptoms that disappear still matter", "lesson": "A transient ischemic attack produces temporary neurological symptoms without persistent infarction, but it can signal a high risk of future stroke. Sudden symptoms require urgent assessment even if they resolve.", "type": "mcq", "question": "A person's speech becomes slurred for ten minutes and then returns to normal. What is the best interpretation?", "options": ["It can be ignored because it resolved", "It may be a TIA and needs urgent assessment", "It is definitely anxiety", "It proves a brain tumor"], "correct": 1, "explanation": "Temporary focal neurological symptoms can represent a TIA and require urgent evaluation.", "reflection": "Why can temporary symptoms still represent serious risk?"}, {"day": 13, "chapter": "Brain and Nervous System", "title": "Neuron Signal Journey", "subtitle": "From dendrite to axon terminal", "lesson": "Dendrites receive signals, the cell body integrates them, an action potential travels along the axon and neurotransmitters are released from axon terminals across a synapse.", "type": "sequence", "question": "Arrange the path of information through a typical neuron.", "items": ["Dendrites", "Cell body", "Axon", "Axon terminals", "Synapse"], "reflection": "What role does the synapse play in communication between cells?"}, {"day": 14, "chapter": "Brain and Nervous System", "title": "Seizure Safety", "subtitle": "Protect, time and observe", "lesson": "During a generalized convulsive seizure, protect the person from injury, move dangerous objects, cushion the head if possible, time the seizure and seek emergency help when indicated. Do not restrain them or put objects in their mouth.", "type": "multi", "question": "Select the THREE appropriate seizure first-aid actions.", "options": ["Time the seizure", "Hold the person down firmly", "Move nearby hazards", "Put a spoon in the mouth", "Protect the head"], "correct": [0, 2, 4], "explanation": "Time the event, reduce injury risk and protect the head. Restraint and objects in the mouth can cause harm.", "reflection": "Which common seizure myth could cause injury?"}, {"day": 15, "chapter": "Brain and Nervous System", "title": "Checkpoint: Sudden Weakness", "subtitle": "Neurological emergency reasoning", "lesson": "Sudden one-sided weakness, facial asymmetry and speech difficulty strongly suggest an acute neurological event. The safest response emphasizes emergency action rather than waiting for certainty.", "type": "mcq", "question": "A patient suddenly cannot lift the left arm and has facial drooping. What should happen next?", "options": ["Offer food and observe for two hours", "Call emergency services immediately", "Ask them to sleep", "Book a routine appointment next month"], "correct": 1, "explanation": "Sudden focal neurological deficits are possible stroke signs and require immediate emergency response.", "reflection": "How does the principle 'time is brain' influence decision-making?", "checkpoint": true}, {"day": 16, "chapter": "Hormones and Metabolism", "title": "Type 1 vs Type 2 Diabetes", "subtitle": "Deficiency and resistance", "lesson": "Type 1 diabetes results from autoimmune destruction of pancreatic beta cells and severe insulin deficiency. Type 2 diabetes commonly involves insulin resistance followed by progressive beta-cell dysfunction.", "type": "matching", "question": "Match each feature to the most appropriate condition.", "pairs": [["Autoimmune beta-cell destruction", "Type 1 diabetes"], ["Insulin resistance", "Type 2 diabetes"], ["Requires insulin replacement", "Type 1 diabetes"], ["Often develops gradually", "Type 2 diabetes"]], "reflection": "Why do both conditions cause elevated blood glucose through different mechanisms?"}, {"day": 17, "chapter": "Hormones and Metabolism", "title": "Recognize Hyperglycemia", "subtitle": "Classic symptoms", "lesson": "Marked hyperglycemia can cause excessive thirst, frequent urination, fatigue, blurred vision and weight loss. In type 1 diabetes, vomiting, abdominal pain, deep breathing or drowsiness can signal diabetic ketoacidosis.", "type": "mcq", "question": "Which symptom group most strongly suggests new diabetes?", "options": ["Thirst, frequent urination and weight loss", "Ear pain and a sprained ankle", "Sneezing and itchy eyes only", "A single bruise"], "correct": 0, "explanation": "Polydipsia, polyuria and unexplained weight loss are classic warning symptoms of diabetes.", "reflection": "Why does high blood glucose lead to frequent urination and thirst?"}, {"day": 18, "chapter": "Hormones and Metabolism", "title": "The Stress Axis", "subtitle": "Cortisol regulation", "lesson": "During stress, the hypothalamus releases CRH, the pituitary releases ACTH and the adrenal cortex releases cortisol. Cortisol then contributes to negative feedback at the hypothalamus and pituitary.", "type": "sequence", "question": "Put the HPA-axis signals in order.", "items": ["Hypothalamus releases CRH", "Pituitary releases ACTH", "Adrenal cortex releases cortisol", "Cortisol provides negative feedback"], "reflection": "Why is negative feedback important after a stress response?"}, {"day": 19, "chapter": "Hormones and Metabolism", "title": "Hashimoto's vs Graves'", "subtitle": "Two autoimmune thyroid disorders", "lesson": "Hashimoto's disease commonly damages thyroid tissue and causes hypothyroidism. Graves' disease stimulates the TSH receptor and causes hyperthyroidism. Their symptoms and laboratory patterns tend to move in opposite directions.", "type": "matching", "question": "Match the finding to the most likely disorder.", "pairs": [["Heat intolerance and tremor", "Graves' disease"], ["Fatigue and cold intolerance", "Hashimoto's disease"], ["Low TSH with high thyroid hormone", "Graves' disease"], ["High TSH with low free T4", "Hashimoto's disease"]], "reflection": "How can autoimmunity produce either underactivity or overactivity?"}, {"day": 20, "chapter": "Hormones and Metabolism", "title": "Checkpoint: Excessive Thirst", "subtitle": "Select the condition and test", "lesson": "Clinical reasoning combines symptoms with appropriate tests. Excessive thirst, frequent urination and weight loss suggest hyperglycemia. Blood glucose and HbA1c are relevant tests, while urgent assessment is needed if severe illness is present.", "type": "multi", "question": "A 15-year-old has thirst, frequent urination and weight loss. Select the THREE best responses.", "options": ["Consider diabetes", "Check blood glucose", "Dismiss the symptoms as normal growth", "Arrange medical assessment", "Diagnose asthma"], "correct": [0, 1, 3], "explanation": "The symptom pattern suggests diabetes and warrants glucose testing and medical assessment.", "reflection": "What additional symptom could indicate a more urgent metabolic emergency?", "checkpoint": true}, {"day": 21, "chapter": "Clinical Skills", "title": "Hand Hygiene Moments", "subtitle": "Prevent transmission", "lesson": "Hand hygiene is required before touching a patient, before clean procedures, after body-fluid exposure risk, after touching a patient and after touching the patient's surroundings.", "type": "multi", "question": "When should a healthcare worker clean their hands?", "options": ["Before patient contact", "Only at the end of the day", "After body-fluid exposure risk", "After touching patient surroundings", "Only when hands look dirty"], "correct": [0, 2, 3], "explanation": "Hand hygiene is performed at defined moments even when hands do not visibly appear dirty.", "reflection": "How does hand hygiene protect both patients and healthcare workers?"}, {"day": 22, "chapter": "Clinical Skills", "title": "Pulse Oximetry", "subtitle": "Use the number carefully", "lesson": "Pulse oximetry estimates peripheral oxygen saturation. Readings can be affected by motion, poor circulation, nail products and device fit. The number must be interpreted alongside symptoms and clinical condition.", "type": "mcq", "question": "A pulse oximeter gives an unexpectedly low reading while the hand is moving. What is the best next action?", "options": ["Assume the reading is perfectly accurate", "Improve positioning and repeat while still", "Ignore all oxygen readings forever", "Diagnose pneumonia immediately"], "correct": 1, "explanation": "Motion can distort the signal. Repositioning and repeating the reading helps assess reliability.", "reflection": "Why should a device reading never be interpreted without context?"}, {"day": 23, "chapter": "Clinical Skills", "title": "Patient Identification", "subtitle": "Right patient, right procedure", "lesson": "Before medication, specimen collection or a procedure, healthcare teams use at least two identifiers, such as full name and date of birth. Room number alone is not a reliable identifier.", "type": "mcq", "question": "Which identification approach is safest before collecting blood?", "options": ["Ask only for the room number", "Use full name and date of birth", "Recognize the patient's clothing", "Assume the nearby chart is correct"], "correct": 1, "explanation": "Two independent identifiers reduce wrong-patient errors.", "reflection": "Why are routine safety checks especially important in busy hospitals?"}, {"day": 24, "chapter": "Clinical Skills", "title": "Read the Vital-Sign Pattern", "subtitle": "Numbers form a clinical picture", "lesson": "A pattern of fever, rapid heart rate and rapid breathing may suggest physiological stress or infection. A single number is less informative than the overall trend, symptoms and repeated measurements.", "type": "mcq", "question": "Which pattern deserves prompt clinical attention?", "options": ["Temperature 36.7°C, pulse 70, breathing 14", "Temperature 39.2°C, pulse 124, breathing 28", "Pulse 72 after quiet rest", "Normal oxygen saturation with no symptoms"], "correct": 1, "explanation": "High fever with tachycardia and tachypnea indicates significant physiological stress and requires assessment.", "reflection": "What information besides vital signs would help interpret this pattern?"}, {"day": 25, "chapter": "Clinical Skills", "title": "Checkpoint: Safe Hospital Workflow", "subtitle": "Prioritize safety", "lesson": "Clinical professionalism includes identification, confidentiality, infection prevention, clear communication and escalation when a patient's condition changes.", "type": "sequence", "question": "Arrange a safe sequence before a simple bedside procedure.", "items": ["Confirm patient identity", "Explain the procedure and obtain agreement", "Perform hand hygiene", "Prepare equipment safely", "Complete the procedure and document"], "reflection": "Which step is easiest to overlook and why?", "checkpoint": true}, {"day": 26, "chapter": "Future Healthcare Professional", "title": "Confidentiality", "subtitle": "Protect patient information", "lesson": "Patient information should be accessed only for legitimate care or approved educational purposes. Cases used for learning must be de-identified. Public posts should never reveal identifiable patient details.", "type": "mcq", "question": "Which action respects confidentiality during a student placement?", "options": ["Post a memorable patient story with room number", "Discuss an identifiable patient with friends", "Write a general reflection without patient identifiers", "Photograph a patient chart"], "correct": 2, "explanation": "General professional reflection can be appropriate when no patient can be identified and institutional rules are followed.", "reflection": "How can you learn from clinical experience without exposing private information?"}, {"day": 27, "chapter": "Future Healthcare Professional", "title": "Team-Based Care", "subtitle": "Medicine is collaborative", "lesson": "Modern healthcare depends on physicians, nurses, pharmacists, therapists, laboratory teams, radiographers and many others. Safe care requires clear roles, respectful communication and escalation of concerns.", "type": "matching", "question": "Match the professional to a typical contribution.", "pairs": [["Pharmacist", "Medication expertise"], ["Physiotherapist", "Movement and rehabilitation"], ["Radiographer", "Acquires diagnostic images"], ["Nurse", "Ongoing assessment and bedside care"]], "reflection": "What makes communication across professions difficult, and how can teams improve it?"}, {"day": 28, "chapter": "Future Healthcare Professional", "title": "Communicating Uncertainty", "subtitle": "Honesty builds trust", "lesson": "Healthcare professionals often work with incomplete information. Good communication distinguishes what is known, what is suspected, what tests may clarify the situation and what warning signs require action.", "type": "mcq", "question": "Which statement communicates uncertainty professionally?", "options": ["I know exactly what this is without examining you", "There are several possibilities; assessment and testing can clarify them", "Nothing serious could ever happen", "The internet result proves the diagnosis"], "correct": 1, "explanation": "Professional communication is honest about uncertainty and explains how the question can be investigated.", "reflection": "Why can admitting uncertainty be a sign of competence rather than weakness?"}, {"day": 29, "chapter": "Future Healthcare Professional", "title": "Teach It Simply", "subtitle": "Science communication", "lesson": "Clear health education begins with the main idea, uses familiar language, defines necessary terms and checks understanding. Simplicity should preserve accuracy rather than remove important meaning.", "type": "mcq", "question": "Which explanation is most suitable for a general audience?", "options": ["Hypertension is chronic elevation of systemic arterial pressure that increases vascular risk", "High blood pressure means blood pushes against artery walls with too much force over time, increasing strain on organs", "BP bad", "Use unexplained abbreviations only"], "correct": 1, "explanation": "The second explanation is clear, accurate and understandable without unnecessary jargon.", "reflection": "Rewrite one medical term you learned into plain language."}, {"day": 30, "chapter": "Future Healthcare Professional", "title": "Final Virtual Patient", "subtitle": "Integrated clinical reasoning", "lesson": "Your final patient combines emergency recognition, vital signs, focused testing and safe escalation. The goal is not to practise independent diagnosis; it is to demonstrate structured educational reasoning.", "type": "final", "question": "A 58-year-old develops sudden right-arm weakness, facial drooping and difficulty speaking. Vital signs: BP 182/104, pulse 96, oxygen saturation 97%. Choose the best complete pathway.", "options": ["Wait 30 minutes, give food and reassess", "Recognize possible stroke, note time last known well, call emergency services and prepare for urgent brain imaging", "Diagnose migraine and send the patient home", "Lower the blood pressure using someone else's medication before seeking help"], "correct": 1, "explanation": "The presentation strongly suggests possible acute stroke. Immediate emergency activation, timing and urgent imaging are central to the pathway.", "reflection": "What three principles from the entire challenge guided your final decision?", "checkpoint": true}];
  const stateKey='medminuteChallengeModeV2';
  const legacyKey='medminuteChallengeProgress';
  const chapterOrder=[...new Set(challenges.map(c=>c.chapter))];
  const chapterIcons=['＋','♥','⚡','◉','✚','★'];
  let state;
  try{state=JSON.parse(localStorage.getItem(stateKey)||'null')}catch(e){state=null}
  if(!state) state={completed:[],xp:0,streak:0,lastCompleted:null,ratings:{},reflections:{},confidence:{}};
  let currentDay=null,currentPhase='learn',lives=3,attempts=0,taskState={};

  const $=id=>document.getElementById(id);
  const esc=value=>{const d=document.createElement('div');d.textContent=String(value??'');return d.innerHTML};

  function save(){
    localStorage.setItem(stateKey,JSON.stringify(state));
    localStorage.setItem(legacyKey,JSON.stringify(state.completed));
    updateSummary();renderMap();renderBadges();
  }
  function isUnlocked(day){return day===1||state.completed.includes(day-1)}
  function updateSummary(){
    $('challengeXP').textContent=state.xp||0;
    $('challengeLevel').textContent=Math.floor((state.xp||0)/500)+1;
    $('challengeStreakValue').textContent=state.streak||0;
    $('challengeCompletedValue').textContent=`${state.completed.length}/30`;
    $('challengeProgressBar').style.width=`${state.completed.length/30*100}%`;
    $('challengeProgressText').textContent=`${state.completed.length} of 30 days completed`;
  }

  function renderMap(){
    root.innerHTML=chapterOrder.map((chapter,chapterIndex)=>{
      const days=challenges.filter(c=>c.chapter===chapter);
      const completed=days.filter(c=>state.completed.includes(c.day)).length;
      return `<section class="challenge-chapter ${completed===days.length?'complete':''}">
        <div class="challenge-chapter-heading"><span>${chapterIcons[chapterIndex]}</span><div><strong>${esc(chapter)}</strong><small>${completed}/${days.length} complete</small></div></div>
        <div class="challenge-day-path">${days.map(c=>{
          const locked=!isUnlocked(c.day),done=state.completed.includes(c.day),active=currentDay===c.day;
          return `<button type="button" class="challenge-map-day ${locked?'locked':''} ${done?'completed':''} ${active?'active':''}" data-open-day="${c.day}" ${locked?'disabled':''}>
            <span>${done?'✓':locked?'🔒':c.day}</span><small>${esc(c.title)}</small>
          </button>`;
        }).join('')}</div>
      </section>`;
    }).join('');
    root.querySelectorAll('[data-open-day]').forEach(btn=>btn.addEventListener('click',()=>openDay(Number(btn.dataset.openDay))));
  }

  function renderBadges(){
    $('challengeBadges').innerHTML=chapterOrder.map((chapter,i)=>{
      const days=challenges.filter(c=>c.chapter===chapter);
      const earned=days.every(c=>state.completed.includes(c.day));
      return `<div class="chapter-badge ${earned?'earned':''}" title="${esc(chapter)}"><span>${chapterIcons[i]}</span><small>${earned?chapter:'Locked'}</small></div>`;
    }).join('');
  }

  function openDay(day){
    if(!isUnlocked(day)) return;
    currentDay=day;currentPhase='learn';lives=3;attempts=0;taskState={};
    const c=challenges[day-1];
    $('challengeEmpty').hidden=true;$('challengeActivity').hidden=false;$('challengeCompletion').hidden=true;
    $('challengeDayLabel').textContent=`Day ${day}${c.checkpoint?' · Checkpoint':''}`;
    $('challengeActivityTitle').textContent=c.title;$('challengeActivitySubtitle').textContent=c.subtitle;
    $('challengeLesson').innerHTML=`<div class="challenge-lesson-number">${String(day).padStart(2,'0')}</div><h3>What you need to know</h3><p>${esc(c.lesson)}</p>${c.checkpoint?'<div class="checkpoint-callout"><strong>Chapter checkpoint</strong><span>This task combines several ideas from the chapter.</span></div>':''}`;
    $('challengeReflectionPrompt').textContent=c.reflection;
    $('challengeReflection').value=state.reflections[day]||'';
    $('challengeConfidence').value=state.confidence[day]||3;
    $('challengeConfidenceLabel').textContent=`${$('challengeConfidence').value} / 5`;
    $('challengeFeedback').innerHTML='';$('challengeRetry').hidden=true;$('challengeCheckAnswer').hidden=false;
    updateLives();showPhase('learn');renderMap();
    scrollTo({top:$('challengeActivity').offsetTop-100,behavior:'smooth'});
  }

  function showPhase(phase){
    currentPhase=phase;
    document.querySelectorAll('.challenge-phase').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('[data-challenge-phase]').forEach(b=>b.classList.remove('active'));
    $(`challenge${phase[0].toUpperCase()+phase.slice(1)}Phase`)?.classList.add('active');
    document.querySelector(`[data-challenge-phase="${phase}"]`)?.classList.add('active');
  }

  function renderTask(){
    const c=challenges[currentDay-1],box=$('challengeTask');taskState={};
    if(c.type==='mcq'||c.type==='final'){
      box.innerHTML=`<div class="challenge-question-card ${c.type==='final'?'final-patient-card':''}">
      ${c.type==='final'?'<div class="virtual-patient-header"><div class="patient-avatar">58</div><div><strong>Virtual Patient</strong><span>Sudden neurological symptoms</span></div></div>':''}
      <h3>${esc(c.question)}</h3><div class="challenge-options">${c.options.map((o,i)=>`<button type="button" class="challenge-option" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div></div>`;
      box.querySelectorAll('.challenge-option').forEach(b=>b.addEventListener('click',()=>{box.querySelectorAll('.challenge-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');taskState.answer=Number(b.dataset.answer);}));
    } else if(c.type==='multi'){
      box.innerHTML=`<div class="challenge-question-card"><h3>${esc(c.question)}</h3><p class="small">Select all correct answers.</p><div class="challenge-options">${c.options.map((o,i)=>`<button type="button" class="challenge-option multi" data-answer="${i}"><span>□</span>${esc(o)}</button>`).join('')}</div></div>`;
      taskState.answers=[];
      box.querySelectorAll('.challenge-option').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('selected');b.querySelector('span').textContent=b.classList.contains('selected')?'✓':'□';taskState.answers=[...box.querySelectorAll('.challenge-option.selected')].map(x=>Number(x.dataset.answer));}));
    } else if(c.type==='matching'){
      const right=[...c.pairs.map(p=>p[1])].sort(()=>Math.random()-.5);
      box.innerHTML=`<div class="challenge-question-card"><h3>${esc(c.question)}</h3><div class="matching-grid">${c.pairs.map((p,i)=>`<label><strong>${esc(p[0])}</strong><select data-match="${i}"><option value="">Choose…</option>${right.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select></label>`).join('')}</div></div>`;
    } else if(c.type==='sequence'){
      const shuffled=[...c.items].sort(()=>Math.random()-.5);
      taskState.order=shuffled;
      box.innerHTML=`<div class="challenge-question-card"><h3>${esc(c.question)}</h3><p class="small">Use the arrows to arrange the steps.</p><div class="sequence-list">${shuffled.map((item,i)=>`<div class="sequence-item" data-sequence="${i}"><span>${i+1}</span><strong>${esc(item)}</strong><div><button type="button" data-move="up">↑</button><button type="button" data-move="down">↓</button></div></div>`).join('')}</div></div>`;
      bindSequence();
    }
  }

  function bindSequence(){
    $('challengeTask').querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>{
      const item=btn.closest('.sequence-item'),list=item.parentElement;
      if(btn.dataset.move==='up'&&item.previousElementSibling)list.insertBefore(item,item.previousElementSibling);
      if(btn.dataset.move==='down'&&item.nextElementSibling)list.insertBefore(item.nextElementSibling,item);
      [...list.children].forEach((el,i)=>el.querySelector('span').textContent=i+1);
    }));
  }

  function checkAnswer(){
    const c=challenges[currentDay-1];let correct=false,answered=true;
    if(c.type==='mcq'||c.type==='final'){answered=Number.isInteger(taskState.answer);correct=taskState.answer===c.correct;}
    if(c.type==='multi'){answered=taskState.answers?.length>0;correct=JSON.stringify([...taskState.answers].sort())===JSON.stringify([...c.correct].sort());}
    if(c.type==='matching'){
      const selects=[...$('challengeTask').querySelectorAll('select')];answered=selects.every(s=>s.value);
      correct=answered&&selects.every((s,i)=>s.value===c.pairs[i][1]);
    }
    if(c.type==='sequence'){
      const order=[...$('challengeTask').querySelectorAll('.sequence-item strong')].map(x=>x.textContent);
      answered=true;correct=JSON.stringify(order)===JSON.stringify(c.items);
    }
    if(!answered){$('challengeFeedback').innerHTML='<div class="notice"><strong>Complete the activity first.</strong><p>Select or arrange an answer before checking.</p></div>';return;}
    attempts++;
    if(correct){
      $('challengeFeedback').innerHTML=`<div class="success"><strong>Correct.</strong><p>${esc(c.explanation||'You arranged every step correctly.')}</p></div>`;
      $('challengeCheckAnswer').hidden=true;
      document.querySelector('[data-challenge-phase="reflect"]').disabled=false;
      setTimeout(()=>showPhase('reflect'),650);
    } else {
      lives=Math.max(0,lives-1);updateLives();
      $('challengeFeedback').innerHTML=`<div class="warning"><strong>Not quite.</strong><p>${lives>0?'Review the lesson and try once more.':'No lives remain, but you can review and restart the task.'}</p></div>`;
      $('challengeRetry').hidden=false;$('challengeCheckAnswer').hidden=true;
    }
  }

  function retry(){
    if(lives===0){lives=3;attempts=0;}
    $('challengeFeedback').innerHTML='';$('challengeRetry').hidden=true;$('challengeCheckAnswer').hidden=false;renderTask();updateLives();
  }
  function updateLives(){$('challengeLives').textContent=Array.from({length:3},(_,i)=>i<lives?'♥':'♡').join(' ');}

  function finishDay(){
    const reflection=$('challengeReflection').value.trim();
    if(reflection.length<8){alert('Write at least one short sentence before completing the day.');return;}
    const confidence=Number($('challengeConfidence').value),day=currentDay,c=challenges[day-1];
    const already=state.completed.includes(day);
    const rating=attempts<=1?'Gold':attempts===2?'Silver':'Bronze';
    const xp=rating==='Gold'?100:rating==='Silver'?75:50;
    state.reflections[day]=reflection;state.confidence[day]=confidence;state.ratings[day]=rating;
    if(!already){state.completed.push(day);state.completed.sort((a,b)=>a-b);state.xp+=xp;
      const today=new Date().toISOString().slice(0,10),last=state.lastCompleted;
      if(last!==today){
        if(last){const gap=(new Date(today)-new Date(last))/86400000;state.streak=gap===1?(state.streak||0)+1:1;}else state.streak=1;
        state.lastCompleted=today;
      }
      window.medminuteTrackImpact?.('quiz_completed',{url:'challenge.html',title:`Challenge Day ${day}: ${c.title}`});
    }
    save();
    document.querySelectorAll('.challenge-phase').forEach(p=>p.classList.remove('active'));
    $('challengeCompletion').hidden=false;
    $('challengeCompletionTitle').textContent=day===30?'Challenge Complete — Virtual Patient Passed!':`${c.title} completed.`;
    $('challengeCompletionMessage').textContent=day===30?'You completed all six chapters and demonstrated structured medical reasoning across the full challenge.':'The next learning activity is now unlocked.';
    $('challengeEarnedXP').textContent=`+${already?0:xp} XP`;
    $('challengeEarnedRating').textContent=rating;
    $('challengeNextDay').textContent=day===30?'View Certificate Centre':'Continue to Next Day';
  }

  $('startChallengeButton').addEventListener('click',()=>openDay(1));
  $('challengeBeginTask').addEventListener('click',()=>{renderTask();document.querySelector('[data-challenge-phase="complete"]').disabled=false;showPhase('complete');});
  $('challengeCheckAnswer').addEventListener('click',checkAnswer);
  $('challengeRetry').addEventListener('click',retry);
  $('challengeFinishDay').addEventListener('click',finishDay);
  $('challengeNextDay').addEventListener('click',()=>{if(currentDay===30)location.href='certificates.html';else openDay(currentDay+1);});
  $('challengeConfidence').addEventListener('input',e=>$('challengeConfidenceLabel').textContent=`${e.target.value} / 5`);
  document.querySelectorAll('[data-challenge-phase]').forEach(btn=>btn.addEventListener('click',()=>{if(!btn.disabled)showPhase(btn.dataset.challengePhase);}));

  updateSummary();renderMap();renderBadges();
  const next=challenges.find(c=>!state.completed.includes(c.day)&&isUnlocked(c.day));
  if(state.completed.length&&next) openDay(next.day);
});

// MedMinute 4.3 Professional Anatomy Explorer
document.addEventListener('DOMContentLoaded', () => {
  const dataNode = document.getElementById('anatomyStructureData');
  const viewport = document.getElementById('studioModelViewport');
  const model = document.querySelector('.studio-human-model');
  if (!dataNode || !viewport || !model) return;

  let structures = {};
  try { structures = JSON.parse(dataNode.textContent); }
  catch (error) { console.error('Anatomy data error', error); return; }

  const organButtons = [...model.querySelectorAll('.organ-button[data-organ]')];
  const structureIds = Object.keys(structures);
  let selected = 'heart';
  let zoom = 1;
  let rotation = 0;
  let regionOffset = {x:0,y:0};
  const viewedKey = 'medminuteAnatomyStructuresViewed';
  let viewed = new Set();
  try { viewed = new Set(JSON.parse(localStorage.getItem(viewedKey) || '[]')); } catch (_) {}

  const text = (id,value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '';
  };
  const escapeHTML = value => {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  };

  function renderViewed() {
    const count = viewed.size;
    text('anatomyStructuresViewed', `${count} structure${count===1?'':'s'} explored`);
    const bar = document.getElementById('anatomyProgressBar');
    if (bar) bar.style.width = `${Math.min(100,count/structureIds.length*100)}%`;
  }

  function structureIcon(id) {
    const icons = {
      brain:'✦', eyes:'◉', thyroid:'T', trachea:'Y', lungs:'◌', heart:'♥',
      liver:'L', gallbladder:'G', stomach:'S', spleen:'Sp', pancreas:'P',
      kidneys:'K', 'small-intestine':'SI', 'large-intestine':'LI', bladder:'B',
      musculoskeletal:'M'
    };
    return icons[id] || '＋';
  }

  function updateStructure(id, scrollPanel=false) {
    const item = structures[id];
    if (!item) return;
    selected = id;
    viewed.add(id);
    localStorage.setItem(viewedKey, JSON.stringify([...viewed]));
    renderViewed();

    organButtons.forEach(button => button.classList.toggle('active', button.dataset.organ === id));
    text('studioStructureTitle', item.title);
    text('studioStructureSpecialty', item.specialty);
    text('studioStructureDescription', item.description);
    text('studioStructureIcon', structureIcon(id));

    const fn = document.getElementById('studioStructureFunctions');
    if (fn) fn.innerHTML = (item.functions || []).map(x => `<li>${escapeHTML(x)}</li>`).join('');
    const skills = document.getElementById('studioStructureSkills');
    if (skills) skills.innerHTML = (item.skills || []).map(x => `<span>${escapeHTML(x)}</span>`).join('') || '<span>General examination</span>';
    const conditions = document.getElementById('studioStructureConditions');
    if (conditions) conditions.innerHTML = (item.conditions || []).map(x => `<li>${escapeHTML(x)}</li>`).join('');
    const links = document.getElementById('studioStructureLinks');
    if (links) {
      links.innerHTML = (item.resources || []).length
        ? item.resources.map(x => `<a href="${encodeURI(x.url)}">${escapeHTML(x.label)}</a>`).join('')
        : '<span class="anatomy-no-links">Related learning resources are being expanded.</span>';
    }

    if (scrollPanel && innerWidth < 1050) {
      document.querySelector('.anatomy-structure-panel')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  function applyModelTransform() {
    model.style.transform = `translate(${regionOffset.x}px,${regionOffset.y}px) scale(${zoom}) rotateY(${rotation}deg)`;
  }

  function setLayer(layer) {
    viewport.classList.remove('mode-exterior','mode-muscles','mode-skeleton');
    if (layer !== 'organs') viewport.classList.add(`mode-${layer}`);
    document.querySelectorAll('.studio-layer').forEach(button =>
      button.classList.toggle('active', button.dataset.layer === layer)
    );
  }

  organButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      updateStructure(button.dataset.organ, true);
    });
  });

  document.querySelectorAll('.studio-layer').forEach(button =>
    button.addEventListener('click', () => setLayer(button.dataset.layer))
  );

  document.getElementById('studioZoomIn')?.addEventListener('click', () => {
    zoom = Math.min(1.7, zoom + .12); applyModelTransform();
  });
  document.getElementById('studioZoomOut')?.addEventListener('click', () => {
    zoom = Math.max(.7, zoom - .12); applyModelTransform();
  });
  document.getElementById('studioRotateLeft')?.addEventListener('click', () => {
    rotation = Math.max(-22, rotation - 5); applyModelTransform();
  });
  document.getElementById('studioRotateRight')?.addEventListener('click', () => {
    rotation = Math.min(22, rotation + 5); applyModelTransform();
  });
  document.getElementById('studioResetModel')?.addEventListener('click', () => {
    zoom=1;rotation=0;regionOffset={x:0,y:0};applyModelTransform();setLayer('organs');
    viewport.classList.remove('system-filter');
    organButtons.forEach(button => button.classList.remove('system-visible'));
    document.querySelectorAll('.anatomy-system-button').forEach(b => b.classList.toggle('active',b.dataset.system==='all'));
  });

  document.querySelectorAll('.anatomy-system-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.anatomy-system-button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const ids = JSON.parse(button.dataset.organs || '[]');
      if (button.dataset.system === 'all' || !ids.length) {
        viewport.classList.remove('system-filter');
        organButtons.forEach(x => x.classList.remove('system-visible'));
      } else {
        viewport.classList.add('system-filter');
        organButtons.forEach(x => x.classList.toggle('system-visible', ids.includes(x.dataset.organ)));
        if (ids[0]) updateStructure(ids[0]);
      }
      if (button.dataset.system === 'skeletal') setLayer('skeleton');
      else if (button.dataset.system === 'muscular') setLayer('muscles');
      else setLayer('organs');
    });
  });

  const search = document.getElementById('anatomySearchInput');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    if (!q) return;
    const match = Object.entries(structures).find(([id,item]) =>
      `${id} ${item.title} ${item.specialty} ${item.description} ${(item.conditions||[]).join(' ')}`.toLowerCase().includes(q)
    );
    if (match) {
      setLayer('organs');
      viewport.classList.add('system-filter');
      organButtons.forEach(x => x.classList.toggle('system-visible', x.dataset.organ === match[0]));
      updateStructure(match[0]);
    }
  });
  search?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      search.value='';
      viewport.classList.remove('system-filter');
      organButtons.forEach(x => x.classList.remove('system-visible'));
    }
  });

  const regionPresets = {
    head:{zoom:1.7,x:0,y:250}, thorax:{zoom:1.45,x:0,y:95}, abdomen:{zoom:1.45,x:0,y:-70},
    pelvis:{zoom:1.5,x:0,y:-220}, upper:{zoom:1.2,x:0,y:0}, lower:{zoom:1.35,x:0,y:-300}
  };
  document.querySelectorAll('[data-region]').forEach(button => {
    button.addEventListener('click', () => {
      const preset = regionPresets[button.dataset.region];
      if (preset) {zoom=preset.zoom;regionOffset={x:preset.x,y:preset.y};rotation=0;applyModelTransform();}
      setLayer('organs');
      updateStructure(button.dataset.organ);
    });
  });

  document.getElementById('studioAskTutor')?.addEventListener('click', () => {
    sessionStorage.setItem('medminuteTutorTopic', structures[selected]?.title || selected);
    location.href = `ai-tutor.html?topic=${encodeURIComponent(structures[selected]?.title || selected)}`;
  });

  function showTour() {
    const steps = [
      ['Choose a system','Use the left panel to isolate organs belonging to a body system.'],
      ['Explore the model','Click a visible structure, then zoom or rotate the model using the floating controls.'],
      ['Connect anatomy with medicine','The right panel links structures to functions, tests, diseases and MedMinute articles.'],
      ['Explore by region','Use the region cards to focus on the head, thorax, abdomen, pelvis or limbs.']
    ];
    let index=0;
    const overlay=document.createElement('div');
    overlay.className='anatomy-tour-overlay';
    const draw=()=>overlay.innerHTML=`<div class="anatomy-tour-card"><span class="eyebrow">Guided tour · ${index+1}/${steps.length}</span><h2>${steps[index][0]}</h2><p>${steps[index][1]}</p><div class="button-row"><button id="closeAnatomyTour" class="btn btn-secondary" type="button">Close</button><button id="nextAnatomyTour" class="btn btn-primary" type="button">${index===steps.length-1?'Finish':'Next'}</button></div></div>`;
    draw();document.body.appendChild(overlay);
    overlay.addEventListener('click',event=>{
      if(event.target.id==='closeAnatomyTour'||event.target===overlay)overlay.remove();
      if(event.target.id==='nextAnatomyTour'){if(index===steps.length-1)overlay.remove();else{index++;draw();}}
    });
  }
  document.getElementById('anatomyTourButton')?.addEventListener('click', showTour);
  document.getElementById('anatomyHelpButton')?.addEventListener('click', showTour);

  renderViewed();
  setLayer('organs');
  updateStructure('heart');
});

// Anatomy-to-AI-Tutor topic handoff
document.addEventListener('DOMContentLoaded', () => {
  const tutorTopic = document.getElementById('tutorTopic');
  if (!tutorTopic) return;
  const queryTopic = new URLSearchParams(location.search).get('topic');
  const savedTopic = sessionStorage.getItem('medminuteTutorTopic');
  const topic = queryTopic || savedTopic;
  if (topic && !tutorTopic.value) tutorTopic.value = topic;
  if (savedTopic) sessionStorage.removeItem('medminuteTutorTopic');
});
