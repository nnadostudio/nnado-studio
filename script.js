const menu=document.querySelector('.menu');const nav=document.querySelector('#nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu'});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu'}));

document.querySelectorAll('.service-package, .website-explainer').forEach(details=>{const summary=details.querySelector(':scope > summary');if(!summary)return;const syncExpanded=()=>summary.setAttribute('aria-expanded',String(details.open));syncExpanded();details.addEventListener('toggle',syncExpanded)});

const inquiryForm=document.querySelector('#inquiry-form');
if(inquiryForm){
  const submitButton=inquiryForm.querySelector('button[type="submit"]');
  const formStatus=inquiryForm.querySelector('#form-status');
  inquiryForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!inquiryForm.reportValidity()){formStatus.textContent='Please complete the required fields above.';formStatus.className='form-status is-error';return}
    submitButton.disabled=true;
    submitButton.textContent='Sending…';
    formStatus.textContent='Sending your project details…';
    formStatus.className='form-status is-loading';
    try{
      const response=await fetch(inquiryForm.action,{method:'POST',body:new FormData(inquiryForm),headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Submission failed');
      inquiryForm.reset();
      submitButton.textContent='Sent ✓';
      formStatus.textContent='Thank you! Your idea is officially in my inbox. I’ll be in touch with next steps.';
      formStatus.className='form-status is-success';
    }catch(error){
      submitButton.disabled=false;
      submitButton.textContent='Send inquiry →';
      formStatus.innerHTML='Something got tangled. Please try again or email <a href="mailto:nnadostudio@gmail.com">nnadostudio@gmail.com</a>.';
      formStatus.className='form-status is-error';
    }
  });
}

const finePointer=window.matchMedia('(pointer: fine)');
if(finePointer.matches){
  const cursor=document.createElement('div');
  cursor.className='star-cursor';
  cursor.setAttribute('aria-hidden','true');
  cursor.textContent='☆';
  document.body.append(cursor);
  document.body.classList.add('custom-cursor-ready');
  let frame;
  let pointerX=0;
  let pointerY=0;
  const placeCursor=()=>{cursor.style.transform=`translate3d(${pointerX}px,${pointerY}px,0) translate(-50%,-50%)`;frame=null};
  window.addEventListener('pointermove',event=>{pointerX=event.clientX;pointerY=event.clientY;cursor.classList.add('is-visible');if(!frame)frame=requestAnimationFrame(placeCursor)});
  document.addEventListener('pointerover',event=>{cursor.classList.toggle('is-active',Boolean(event.target.closest('a, button, input, select, textarea, summary, label')))});
  document.documentElement.addEventListener('mouseleave',()=>cursor.classList.remove('is-visible'));
  document.documentElement.addEventListener('mouseenter',()=>cursor.classList.add('is-visible'));
}
