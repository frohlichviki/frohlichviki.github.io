// Lightbox + gallery filter (only runs if those elements exist)
document.addEventListener('DOMContentLoaded', function(){
  var subBtns = document.querySelectorAll('.subnav button');
  var shots = document.querySelectorAll('.shot');
  var panels = document.querySelectorAll('.tabpanel');
  function applyFilter(f){
    subBtns.forEach(function(x){ x.classList.toggle('on', x.dataset.f === f); });
    // gallery tiles (art)
    shots.forEach(function(s){
      s.style.display = (f === 'all' || s.dataset.c === f) ? '' : 'none';
    });
    // tab panels (science)
    panels.forEach(function(p){
      p.classList.toggle('on', p.dataset.panel === f);
    });
    // contextual notes — show the one matching the active filter
    document.querySelectorAll('.filter-note').forEach(function(n){
      n.classList.toggle('show', n.dataset.note === f);
    });
  }
  subBtns.forEach(function(b){
    b.addEventListener('click', function(){ applyFilter(b.dataset.f); });
  });
  // honor a #filter in the URL (e.g. art.html#astro, science.html#talks),
  // otherwise apply whichever tab is marked "on" by default
  if(subBtns.length){
    var h = (location.hash || '').replace('#','');
    var valid = Array.prototype.some.call(subBtns, function(b){ return b.dataset.f === h; });
    if(valid){
      applyFilter(h);
    } else {
      var current = document.querySelector('.subnav button.on');
      if(current){ applyFilter(current.dataset.f); }
    }
  }

  var lb = document.getElementById('lb');
  if(!lb) return;
  var lImg = lb.querySelector('img');
  var lPh  = lb.querySelector('.lph');
  var lTitle = lb.querySelector('.lb-title');
  var lYear  = lb.querySelector('.lb-year');
  var lDesc  = lb.querySelector('.lb-desc');
  shots.forEach(function(s){
    s.addEventListener('click', function(){
      var t = s.dataset.title || '';
      var y = s.dataset.year || '';
      var d = s.dataset.desc || '';
      var real = s.querySelector('img');
      if(real){ lImg.src = real.src; lImg.style.display=''; lPh.style.display='none'; }
      else { lImg.style.display='none'; lPh.style.display=''; }
      lTitle.textContent = t;
      lYear.textContent = y;
      lDesc.textContent = d;
      lb.classList.add('open');
    });
  });
  function close(){ lb.classList.remove('open'); }
  lb.addEventListener('click', function(e){ if(e.target===lb || e.target.closest('.x')) close(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
});

// Contact form: submit to Formspree via fetch, show inline feedback
document.addEventListener('DOMContentLoaded', function(){
  var form = document.getElementById('inq');
  if(!form) return;
  var msg = document.getElementById('formMsg');
  function show(text, ok){
    msg.textContent = text;
    msg.style.borderColor = ok ? 'var(--sci-1)' : 'var(--art-1)';
    msg.style.color = ok ? 'var(--text)' : 'var(--art-1)';
    msg.classList.add('show');
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(form.action.indexOf('YOUR_FORM_ID') !== -1){
      show('Form not connected yet — add your Formspree ID to start receiving messages.', false);
      return;
    }
    var btn = form.querySelector('.send');
    var original = btn.textContent;
    btn.textContent = 'Sending…'; btn.disabled = true;
    fetch(form.action, {
      method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}
    }).then(function(r){
      if(r.ok){ form.reset(); show('Thank you — your message is on its way. I\u2019ll be in touch.', true); }
      else { show('Something went wrong. Please email me directly instead.', false); }
    }).catch(function(){
      show('Network error. Please email me directly instead.', false);
    }).finally(function(){
      btn.textContent = original; btn.disabled = false;
    });
  });
});
