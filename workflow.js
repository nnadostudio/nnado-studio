/*
  NNADO CLIENT WORKFLOW CONFIG
  Edit service and add-on pricing here. External form, invoice, payment, and
  scheduling URLs are intentionally kept separate from the interface.
*/
const NNADO_WORKFLOW = {
  formEndpoint: 'https://formsubmit.co/ajax/nnadostudio@gmail.com',
  services: {
    logo: {name:'Logo Essentials',priceLabel:'Starting at $600',min:600,max:800,description:'For businesses that need a professional, focused logo system.',addons:['application','pattern','illustration','rush']},
    mini: {name:'Mini Brand',priceLabel:'Starting at $1,200',min:1200,max:1600,description:'For businesses that need more than a logo but do not need a huge identity system.',addons:['application','packaging','sku','socialLaunch','socialTemplates','menu','poster','print','illustration','pattern','guidelines','rush']},
    full: {name:'Full Brand Identity',priceLabel:'Starting at $2,500',min:2500,max:3500,description:'For businesses ready for a complete visual identity and multiple branded applications.',addons:['application','packaging','sku','socialLaunch','socialTemplates','menu','poster','print','illustration','pattern','campaign','guidelines','rush']},
    world: {name:'Complete Brand World',priceLabel:'Starting at $5,000',min:5000,max:7000,description:'For larger identity projects that require strategy, a full visual system, applications, and launch direction.',addons:['application','packaging','sku','socialLaunch','socialTemplates','menu','poster','print','illustration','pattern','campaign','guidelines','rush']},
    web: {name:'Web Design + Build',priceLabel:'Starting at $750',min:750,max:2500,description:'For a custom, brand-forward, responsive website that is designed, built, and prepared for launch.',addons:['webPage','booking','emailSignup','copyLayout','maintenance','ecommerce','rush']},
    alacarte: {name:'À La Carte Design',priceLabel:'Starting at $150',min:150,max:350,description:'For posters, menus, social graphics, packaging labels, launch graphics, and other individual design needs.',addons:['packaging','sku','socialLaunch','socialTemplates','menu','poster','print','illustration','pattern','campaign','rush']},
    retainer: {name:'Ongoing Design Retainer',priceLabel:'Starting at $1,000/month',min:1000,max:1600,monthly:true,description:'For brands that need consistent recurring design support.',addons:['socialLaunch','socialTemplates','poster','print','campaign','rush']},
    unsure: {name:'I’m Not Sure Yet',priceLabel:'Let’s find the right fit',min:null,max:null,description:'For clients who know they need design help but do not know which service fits.',addons:['packaging','socialLaunch','socialTemplates','menu','poster','print','illustration','pattern','campaign']}
  },
  addons: {
    application:{name:'Additional branded application',min:300,max:600,description:'One extra real-world piece using your identity.'},
    packaging:{name:'Packaging design',min:500,max:900,description:'One primary package or label format.'},
    sku:{name:'Additional packaging SKU / variation',min:150,max:300,description:'A coordinated variation after the main package is approved.'},
    socialLaunch:{name:'Social launch graphics',min:350,max:650,description:'A small coordinated set for announcing the brand.'},
    socialTemplates:{name:'Social media templates',min:250,max:450,description:'Reusable layouts for ongoing posts or stories.'},
    menu:{name:'Menu design',min:250,max:500,description:'A clear, branded menu in one agreed format.'},
    poster:{name:'Poster / flyer',min:150,max:350,description:'One promotional design in one primary size.'},
    print:{name:'Print collateral',min:200,max:450,description:'A business card, insert, postcard, or similar piece.'},
    illustration:{name:'Custom illustration',min:300,max:700,description:'Original artwork created for the identity or application.'},
    pattern:{name:'Custom pattern',min:250,max:500,description:'A repeatable graphic pattern unique to the brand.'},
    campaign:{name:'Campaign graphics',min:600,max:1200,description:'A coordinated group of launch or promotional assets.'},
    guidelines:{name:'Additional brand-guide documentation',min:250,max:500,description:'More detailed examples, rules, or application guidance.'},
    webPage:{name:'Additional website page',min:200,max:400,description:'One additional page designed and built to match the approved website system.'},
    booking:{name:'Basic booking or inquiry integration',min:150,max:300,description:'A supported third-party booking tool or inquiry form connected and styled for the website.'},
    emailSignup:{name:'Basic email signup integration',min:100,max:200,description:'A supported third-party email signup form connected and styled for the website.'},
    copyLayout:{name:'Website copy layout + formatting',min:250,max:500,description:'Supplied website copy organized into a clear, readable page hierarchy.'},
    maintenance:{name:'Website maintenance retainer',min:300,max:600,monthly:true,description:'Ongoing content updates and routine support within an agreed monthly scope.'},
    ecommerce:{name:'Small e-commerce setup',min:500,max:1500,description:'A small online store quoted around product count, platform, and required functionality.'},
    rush:{name:'Rush timeline',percent:0.25,description:'Priority scheduling when the requested timing is possible.'}
  },
  integrations: {proposalUrl:'',invoiceUrl:'',depositUrl:'',balanceUrl:'',kickoffUrl:''},
  clientActions: {proposal:'View proposal',invoice:'View invoice',deposit:'Pay deposit',balance:'Pay balance',kickoff:'Book kickoff call'},
  futureClientPortalFields:['projectName','projectStatus','currentPhase','projectTimeline','nextMilestone','upcomingMeeting','paymentStatus','proposalUrl','invoiceUrls','meetingUrl','feedbackResources']
};

const builder=document.querySelector('#project-builder-form');
if(builder){
  const storageKey='nnado-project-builder-v1';
  const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  let state={step:0,service:'',addons:[],fields:{}};
  let submitting=false;
  try{state={...state,...JSON.parse(sessionStorage.getItem(storageKey)||'{}')}}catch(error){sessionStorage.removeItem(storageKey)}
  const requestedService=new URLSearchParams(location.search).get('service');
  if(requestedService&&NNADO_WORKFLOW.services[requestedService])state.service=requestedService;

  const serviceOptions=document.querySelector('#service-options');
  const addonOptions=document.querySelector('#addon-options');
  const estimateRange=document.querySelector('#estimate-range');
  const steps=[...document.querySelectorAll('.workflow-step')];
  const progress=[...document.querySelectorAll('[data-progress]')];
  const summary=document.querySelector('#project-summary');
  const status=document.querySelector('#workflow-status');
  const success=document.querySelector('#workflow-success');

  const save=()=>sessionStorage.setItem(storageKey,JSON.stringify(state));
  const estimate=()=>{
    const service=NNADO_WORKFLOW.services[state.service];
    if(!service||service.min===null)return null;
    let min=service.min,max=service.max;
    state.addons.forEach(id=>{const add=NNADO_WORKFLOW.addons[id];if(add&&!add.percent){min+=add.min;max+=add.max}});
    if(state.addons.includes('rush')){min=Math.round(min*1.25/50)*50;max=Math.round(max*1.25/50)*50}
    return {min,max,monthly:service.monthly};
  };
  const estimateText=()=>{const value=estimate();return value?`${money(value.min)}–${money(value.max)}${value.monthly?' / month':''}`:'To be scoped after review'};

  const renderServices=()=>{
    serviceOptions.innerHTML=Object.entries(NNADO_WORKFLOW.services).map(([id,item],index)=>`<label class="workflow-choice ${state.service===id?'is-selected':''}"><input type="radio" name="primary_service" value="${id}" ${index===0?'required':''} ${state.service===id?'checked':''}><span class="choice-number">${String(index+1).padStart(2,'0')}</span><span class="choice-copy"><b>${item.name}</b><small>${item.description}</small></span><strong>${item.priceLabel}</strong><i aria-hidden="true">☆</i></label>`).join('');
  };
  const renderAddons=()=>{
    const service=NNADO_WORKFLOW.services[state.service];
    if(!service){addonOptions.innerHTML='';return}
    addonOptions.innerHTML=service.addons.map(id=>{const item=NNADO_WORKFLOW.addons[id];const checked=state.addons.includes(id);const price=item.percent?'+25%':`+${money(item.min)}–${money(item.max)}`;return `<label class="addon-choice ${checked?'is-selected':''}"><input type="checkbox" name="project_additions" value="${id}" ${checked?'checked':''}><span><b>${item.name}</b><small>${item.description}</small></span><strong>${price}</strong></label>`}).join('');
    estimateRange.textContent=estimateText();
  };
  const collectFields=()=>{new FormData(builder).forEach((value,key)=>{if(!key.startsWith('_')&&key!=='primary_service'&&key!=='project_additions')state.fields[key]=String(value)});save()};
  const restoreFields=()=>{Object.entries(state.fields).forEach(([name,value])=>{const controls=builder.querySelectorAll(`[name="${CSS.escape(name)}"]`);controls.forEach(control=>{if(control.type==='radio'||control.type==='checkbox')control.checked=control.value===value;else control.value=value})})};
  const updateProgress=()=>progress.forEach((button,index)=>{button.classList.toggle('is-current',index===state.step);button.classList.toggle('is-complete',index<state.step);button.disabled=index>state.step});
  const showStep=index=>{state.step=Math.max(0,Math.min(3,index));steps.forEach((step,i)=>step.hidden=i!==state.step);updateProgress();if(state.step===1)renderAddons();if(state.step===3)renderSummary();save();document.querySelector('.workflow-progress').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
  const validateStep=()=>{
    const current=steps[state.step];
    if(state.step===0&&!state.service){current.querySelector('[data-step-error]').textContent='Choose a starting point so I know what to show you next.';serviceOptions.querySelector('input')?.focus();return false}
    if(state.step===2){const required=[...current.querySelectorAll('[required]')];const invalid=required.find(control=>!control.checkValidity());if(invalid){invalid.reportValidity();current.querySelector('[data-step-error]').textContent='A few required details still need your attention.';return false}}
    current.querySelector('[data-step-error]')?.replaceChildren();return true;
  };
  const renderSummary=()=>{
    collectFields();
    const service=NNADO_WORKFLOW.services[state.service];
    const additions=state.addons.length?state.addons.map(id=>NNADO_WORKFLOW.addons[id].name).join(', '):'None selected';
    summary.innerHTML=`<div><dt>Service</dt><dd>${service?.name||'Not selected'}</dd></div><div><dt>Starting price</dt><dd>${service?.priceLabel||'—'}</dd></div><div><dt>Additions</dt><dd>${additions}</dd></div><div class="summary-estimate"><dt>Estimated range</dt><dd>${estimateText()}</dd></div><div><dt>Desired timeline</dt><dd>${state.fields.timeline||'Not provided'}${state.fields.timeline_flexible?` / ${state.fields.timeline_flexible.toLowerCase()} flexibility`:''}</dd></div><div><dt>Business / brand</dt><dd>${state.fields.business||'Not provided'}</dd></div>`;
  };

  serviceOptions.addEventListener('change',event=>{if(event.target.name!=='primary_service')return;state.service=event.target.value;state.addons=state.addons.filter(id=>NNADO_WORKFLOW.services[state.service].addons.includes(id));renderServices();save()});
  addonOptions.addEventListener('change',event=>{if(event.target.name!=='project_additions')return;state.addons=[...addonOptions.querySelectorAll('input:checked')].map(input=>input.value);renderAddons();save()});
  builder.addEventListener('input',collectFields);
  builder.addEventListener('change',collectFields);
  builder.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>{collectFields();if(validateStep())showStep(state.step+1)}));
  builder.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>{collectFields();showStep(state.step-1)}));
  progress.forEach((button,index)=>button.addEventListener('click',()=>{if(index<=state.step)showStep(index)}));

  builder.addEventListener('submit',async event=>{
    event.preventDefault();
    if(submitting)return;
    collectFields();renderSummary();
    const fingerprint=JSON.stringify({service:state.service,addons:state.addons,fields:state.fields});
    if(sessionStorage.getItem('nnado-last-submission')===fingerprint){status.textContent='This exact project brief was already sent. Change a detail before sending it again.';status.className='workflow-status is-error';return}
    submitting=true;const button=document.querySelector('#send-project');button.disabled=true;button.textContent='Sending…';status.textContent='Sending your project details…';status.className='workflow-status is-loading';
    const payload=new FormData(builder);payload.set('Selected service',NNADO_WORKFLOW.services[state.service].name);payload.set('Selected additions',state.addons.length?state.addons.map(id=>NNADO_WORKFLOW.addons[id].name).join(', '):'None');payload.set('Planning estimate',estimateText());
    try{const response=await fetch(NNADO_WORKFLOW.formEndpoint,{method:'POST',body:payload,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Submission failed');sessionStorage.setItem('nnado-last-submission',fingerprint);sessionStorage.removeItem(storageKey);builder.hidden=true;success.hidden=false;success.focus({preventScroll:true});success.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
    catch(error){submitting=false;button.disabled=false;button.textContent='Send project to Donna →';status.innerHTML='Something got tangled. Please try again or email <a href="mailto:nnadostudio@gmail.com">nnadostudio@gmail.com</a>.';status.className='workflow-status is-error'}
  });

  renderServices();restoreFields();showStep(state.step||0);
}

// Future secure external actions: supply URLs only after a client is accepted.
window.nnadoClientActions={
  create(type,url){if(!url||!NNADO_WORKFLOW.clientActions[type])return null;const link=document.createElement('a');link.className='button client-action';link.textContent=`${NNADO_WORKFLOW.clientActions[type]} →`;link.href=url;link.target='_blank';link.rel='noopener noreferrer';return link},
  // Kickoff links should only be rendered after proposal acceptance and deposit.
  fields:NNADO_WORKFLOW.futureClientPortalFields,
  integrations:NNADO_WORKFLOW.integrations,
  labels:NNADO_WORKFLOW.clientActions
};
