(function(){
  'use strict';

  // ============ CONFIG — ajuste antes de publicar ============
  const STORAGE_KEY = 'noorattar_perfumes_v1';
  const ADMIN_PW = 'attar2026';                 // troque a senha antes de publicar
  const WHATSAPP_NUMBER = '5511999999999';      // troque pelo número real da loja (55DDDXXXXXXXXX)
  // =============================================================

  const CATEGORY_COLORS = {
    'Oud':'#C9A15C', 'Floral':'#e08a97', 'Amadeirado':'#8a6a45', 'Âmbar':'#E4B45C', 'Doce':'#d99bb0'
  };

  const seedProducts = [
    {id:'p1', name:'Oud Malaki', category:'Oud', desc:'Um oud real e encorpado, com fumaça amadeirada que se instala fundo na pele. Para quem busca presença absoluta.', top:'Açafrão, Cardamomo', heart:'Rosa de Taif, Oud', base:'Oud, Âmbar, Sândalo', price:349.9, size:'50ml', stock:8, image:null},
    {id:'p2', name:'Almíscar Real', category:'Âmbar', desc:'Almíscar branco envolto em âmbar quente — quente, sedoso e discreto o suficiente para o dia a dia.', top:'Bergamota, Pera', heart:'Almíscar Branco, Baunilha', base:'Âmbar, Sândalo', price:279.0, size:'50ml', stock:3, image:null},
    {id:'p3', name:'Rosa do Deserto', category:'Floral', desc:'A rosa de Taif em sua forma mais pura, equilibrada por especiarias quentes que evitam o doce em excesso.', top:'Cardamomo, Limão', heart:'Rosa de Taif, Jasmim', base:'Almíscar, Madeira de Oud', price:259.0, size:'50ml', stock:14, image:null},
    {id:'p4', name:'Âmbar Noturno', category:'Âmbar', desc:'Denso e resinoso, para noites frias — âmbar, labdanum e uma pitada de incenso.', top:'Bergamota', heart:'Labdanum, Incenso', base:'Âmbar, Fava Tonka', price:319.0, size:'50ml', stock:0, image:null},
    {id:'p5', name:'Zafar Dourado', category:'Amadeirado', desc:'Sândalo cremoso e madeira de cedro sobre uma base quente de âmbar dourado.', top:'Bergamota, Pimenta Rosa', heart:'Sândalo, Íris', base:'Cedro, Âmbar', price:299.9, size:'50ml', stock:6, image:null},
    {id:'p6', name:'Jasmim de Marrakech', category:'Doce', desc:'Jasmim maduro e mel sobre uma base amadeirada e adocicada, inspirado nos souks ao entardecer.', top:'Laranja, Açafrão', heart:'Jasmim, Mel', base:'Sândalo, Baunilha, Âmbar', price:269.0, size:'50ml', stock:2, image:null}
  ];

  let products = [];
  let currentFilter = 'Todos';
  let currentSearch = '';
  let currentSort = 'relevance';
  let isAdmin = false;
  let uploadedImageData = null;
  let editingId = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function toast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 2600);
  }

  function bottleIcon(color, size){
    return `<div class="bottle-wrap" style="color:${color||'#C9A15C'};width:${size||90}px;"><svg viewBox="0 0 100 180" width="100%" height="100%"><use href="#bottleSymbol"/></svg></div>`;
  }

  function money(v){
    return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }

  function loadProducts(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      products = raw ? JSON.parse(raw) : seedProducts.slice();
      if(!raw) saveProducts();
    }catch(e){
      products = seedProducts.slice();
    }
    renderAll();
  }

  function saveProducts(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }catch(e){
      toast('Não foi possível salvar (armazenamento indisponível no navegador).');
    }
  }

  function renderAll(){
    renderCollectionsNav();
    renderFilterChips();
    renderCatalog();
    if(isAdmin){ renderStats(); renderManageTable(); }
  }

  function renderCollectionsNav(){
    const cats = [...new Set(products.map(p=>p.category))];
    $('#collectionsWrap').innerHTML = cats.map(c=>{
      const count = products.filter(p=>p.category===c).length;
      return `<div class="coll-item" data-cat="${c}"><div class="n">${c}</div><div class="c">${count} fragrâncias</div></div>`;
    }).join('');
    $$('.coll-item').forEach(el=>{
      el.addEventListener('click', ()=>{
        currentFilter = el.dataset.cat;
        renderFilterChips();
        renderCatalog();
        document.getElementById('colecao').scrollIntoView({behavior:'smooth'});
      });
    });
  }

  function renderFilterChips(){
    const cats = ['Todos', ...new Set(products.map(p=>p.category))];
    $('#filterChips').innerHTML = cats.map(c=>
      `<button class="chip ${c===currentFilter?'active':''}" data-cat="${c}">${c}</button>`
    ).join('');
    $$('.chip').forEach(el=>{
      el.addEventListener('click', ()=>{
        currentFilter = el.dataset.cat;
        renderFilterChips();
        renderCatalog();
      });
    });
  }

  function sortList(list){
    const l = list.slice();
    switch(currentSort){
      case 'price-asc': return l.sort((a,b)=>Number(a.price)-Number(b.price));
      case 'price-desc': return l.sort((a,b)=>Number(b.price)-Number(a.price));
      case 'name-asc': return l.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
      default: return l;
    }
  }

  function renderCatalog(){
    let list = products.filter(p => currentFilter==='Todos' || p.category===currentFilter);
    if(currentSearch.trim()){
      const q = currentSearch.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    list = sortList(list);
    const grid = $('#catalogGrid');
    if(list.length===0){
      grid.innerHTML = `<div class="empty-state">Nenhum perfume encontrado com esse filtro.</div>`;
      return;
    }
    grid.innerHTML = list.map(p=>{
      const color = CATEGORY_COLORS[p.category] || '#C9A15C';
      const media = p.image
        ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
        : bottleIcon(color, 92);
      let badge = '';
      if(p.stock === 0) badge = `<div class="badge out">Esgotado</div>`;
      else if(p.stock <= 3) badge = `<div class="badge low">Últimas unidades</div>`;
      return `
      <div class="card">
        <div class="card-media" data-id="${p.id}">${badge}${media}</div>
        <div class="card-body">
          <div class="card-cat">${p.category}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-notes">${p.base||''}</div>
          <div class="card-foot">
            <div class="card-price">${money(p.price)}<span>${p.size||''}</span></div>
            <button class="buy-btn" data-id="${p.id}" ${p.stock===0?'disabled':''}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3.5A9.5 9.5 0 003.9 16.3L3 21l4.8-.9a9.5 9.5 0 109.7-16.6zM12 19.7c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .5.6-2.9-.2-.3A7.7 7.7 0 1112 19.7z"/></svg>
              ${p.stock===0?'Indisponível':'Comprar'}
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

    $$('.card-media').forEach(el=> el.addEventListener('click', ()=>openProductModal(el.dataset.id)));
    $$('.buy-btn').forEach(el=>{
      if(!el.disabled){
        el.addEventListener('click', (e)=>{ e.stopPropagation(); buyOnWhatsapp(el.dataset.id); });
      }
    });
  }

  function openProductModal(id){
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const color = CATEGORY_COLORS[p.category] || '#C9A15C';
    const media = p.image ? `<img src="${p.image}" alt="${p.name}">` : bottleIcon(color, 110);
    $('#productModalBody').innerHTML = `
      <div class="pm-grid">
        <div class="pm-media">${media}</div>
        <div>
          <span class="eyebrow">${p.category}</span>
          <h3 style="margin-top:8px;">${p.name}</h3>
          <p class="sub">${p.size||''} · ${money(p.price)} · ${p.stock>0 ? p.stock+' em estoque' : 'Esgotado'}</p>
          <p style="font-size:14px;opacity:.8;margin-bottom:18px;">${p.desc||''}</p>
          <div class="pyr-visual" style="margin-bottom:22px;">
            <div class="pyr-tier top"><div class="lbl">Topo</div><div class="txt" style="font-size:13px;">${p.top||'—'}</div></div>
            <div class="pyr-tier heart"><div class="lbl">Coração</div><div class="txt" style="font-size:13px;">${p.heart||'—'}</div></div>
            <div class="pyr-tier base"><div class="lbl">Fundo</div><div class="txt" style="font-size:13px;">${p.base||'—'}</div></div>
          </div>
          <button class="btn btn-wine full-btn" id="modalBuyBtn" data-id="${p.id}" ${p.stock===0?'disabled':''}>
            ${p.stock===0?'Fora de estoque':'Comprar via WhatsApp'}
          </button>
        </div>
      </div>`;
    $('#productOverlay').classList.add('show');
    const buyBtn = $('#modalBuyBtn');
    if(buyBtn && !buyBtn.disabled){
      buyBtn.addEventListener('click', ()=>buyOnWhatsapp(p.id));
    }
  }

  function buyOnWhatsapp(id){
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const msg = encodeURIComponent(`Olá! Tenho interesse no perfume ${p.name} (${money(p.price)}). Ainda está disponível?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }

  // ================= ADMIN =================
  function renderStats(){
    const total = products.length;
    const units = products.reduce((s,p)=>s+Number(p.stock),0);
    const low = products.filter(p=>p.stock>0 && p.stock<=3).length;
    const value = products.reduce((s,p)=>s+Number(p.stock)*Number(p.price),0);
    $('#statRow').innerHTML = `
      <div class="stat-card"><b>${total}</b><span>Perfumes cadastrados</span></div>
      <div class="stat-card"><b>${units}</b><span>Unidades em estoque</span></div>
      <div class="stat-card"><b>${low}</b><span>Com estoque baixo</span></div>
      <div class="stat-card"><b>${money(value)}</b><span>Valor total em estoque</span></div>
    `;
  }

  function renderManageTable(){
    $('#manageTableBody').innerHTML = products.map(p=>{
      const color = CATEGORY_COLORS[p.category] || '#C9A15C';
      const thumb = p.image ? `<img src="${p.image}" class="tbl-img">` : `<div class="thumb-wrap">${bottleIcon(color,24)}</div>`;
      return `
      <tr>
        <td>${thumb}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${money(p.price)}</td>
        <td><input type="number" min="0" class="stock-input" data-id="${p.id}" value="${p.stock}"></td>
        <td>
          <button class="mini-btn save-stock" data-id="${p.id}">Salvar</button>
          <button class="mini-btn edit-product" data-id="${p.id}">Editar</button>
          <button class="mini-btn danger del-product" data-id="${p.id}">Excluir</button>
        </td>
      </tr>`;
    }).join('');

    $$('.save-stock').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        const input = document.querySelector(`.stock-input[data-id="${id}"]`);
        const val = Math.max(0, parseInt(input.value||'0',10));
        const p = products.find(x=>x.id===id);
        if(p){
          p.stock = val;
          saveProducts();
          renderAll();
          toast(`Estoque de ${p.name} atualizado para ${val}.`);
        }
      });
    });
    $$('.edit-product').forEach(btn=>{
      btn.addEventListener('click', ()=> startEditProduct(btn.dataset.id));
    });
    $$('.del-product').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        const p = products.find(x=>x.id===id);
        if(!p) return;
        if(confirm(`Excluir "${p.name}" do catálogo? Essa ação não pode ser desfeita.`)){
          products = products.filter(x=>x.id!==id);
          saveProducts();
          renderAll();
          toast('Perfume excluído.');
        }
      });
    });
  }

  function startEditProduct(id){
    const p = products.find(x=>x.id===id);
    if(!p) return;
    editingId = id;
    $('#formTitle').textContent = `Editando: ${p.name}`;
    $('#cancelEditBtn').style.display = 'inline-block';
    $('#submitProductBtn').textContent = 'Salvar alterações';
    $('#fName').value = p.name;
    $('#fCategory').value = p.category;
    $('#fDesc').value = p.desc || '';
    $('#fTop').value = p.top || '';
    $('#fHeart').value = p.heart || '';
    $('#fBase').value = p.base || '';
    $('#fPrice').value = p.price;
    $('#fSize').value = p.size || '';
    $('#fStock').value = p.stock;
    uploadedImageData = p.image || null;
    if(p.image){
      $('#fImagePreview').src = p.image;
      $('#fImagePreview').style.display = 'block';
      $('#removeImageBtn').style.display = 'inline-block';
    } else {
      $('#fImagePreview').style.display = 'none';
      $('#removeImageBtn').style.display = 'none';
    }
    switchTab('add');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function cancelEdit(){
    editingId = null;
    $('#formTitle').textContent = 'Novo perfume';
    $('#cancelEditBtn').style.display = 'none';
    $('#submitProductBtn').textContent = 'Cadastrar perfume';
    resetAddForm();
  }

  function switchTab(tab){
    $$('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    $('#tabAdd').style.display = tab==='add' ? 'block':'none';
    $('#tabManage').style.display = tab==='manage' ? 'block':'none';
  }

  function resetAddForm(){
    $('#addProductForm').reset();
    $('#fImagePreview').style.display='none';
    $('#removeImageBtn').style.display='none';
    uploadedImageData = null;
    $('#addErr').classList.remove('show');
  }

  function enterAdmin(){
    isAdmin = true;
    document.body.classList.add('admin-mode');
    renderStats();
    renderManageTable();
    switchTab('add');
  }
  function exitAdmin(){
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    cancelEdit();
  }

  // ================= INIT / EVENTS =================
  function init(){
    $('#heroBottleSlot').innerHTML = bottleIcon('#E4CFA0', 150);
    $('#aboutArtSlot').innerHTML = bottleIcon('#C9A15C', 130);

    $('#footWhatsapp').addEventListener('click', (e)=>{
      e.preventDefault();
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo site da Noor Attar e gostaria de saber mais sobre os perfumes.')}`, '_blank');
    });

    $('#burgerBtn').addEventListener('click', ()=> $('#mobileDrawer').classList.toggle('open'));
    $$('#mobileDrawer a').forEach(a=> a.addEventListener('click', ()=> $('#mobileDrawer').classList.remove('open')));

    $('#openAdminBtn').addEventListener('click', ()=> $('#loginOverlay').classList.add('show'));
    $('#openAdminBtn2').addEventListener('click', ()=> $('#loginOverlay').classList.add('show'));
    $('#closeLoginModal').addEventListener('click', ()=> $('#loginOverlay').classList.remove('show'));
    $('#closeProductModal').addEventListener('click', ()=> $('#productOverlay').classList.remove('show'));
    [$('#loginOverlay'), $('#productOverlay')].forEach(ov=>{
      ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.classList.remove('show'); });
    });

    $('#loginForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const pw = $('#loginPw').value;
      if(pw === ADMIN_PW){
        $('#loginErr').classList.remove('show');
        $('#loginOverlay').classList.remove('show');
        $('#loginPw').value = '';
        enterAdmin();
      } else {
        $('#loginErr').classList.add('show');
      }
    });

    $('#backToStoreBtn').addEventListener('click', exitAdmin);
    $('#logoutBtn').addEventListener('click', exitAdmin);
    $('#cancelEditBtn').addEventListener('click', cancelEdit);

    $$('.tab-btn').forEach(b=> b.addEventListener('click', ()=>switchTab(b.dataset.tab)));

    $('#searchInput').addEventListener('input', (e)=>{
      currentSearch = e.target.value;
      renderCatalog();
    });
    $('#sortSelect').addEventListener('change', (e)=>{
      currentSort = e.target.value;
      renderCatalog();
    });

    $('#fImage').addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        uploadedImageData = reader.result;
        $('#fImagePreview').src = uploadedImageData;
        $('#fImagePreview').style.display = 'block';
        $('#removeImageBtn').style.display = 'inline-block';
      };
      reader.readAsDataURL(file);
    });
    $('#removeImageBtn').addEventListener('click', ()=>{
      uploadedImageData = null;
      $('#fImage').value = '';
      $('#fImagePreview').style.display = 'none';
      $('#removeImageBtn').style.display = 'none';
    });

    $('#addProductForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = $('#fName').value.trim();
      const price = parseFloat($('#fPrice').value);
      const stock = parseInt($('#fStock').value,10);
      if(!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0){
        $('#addErr').textContent = 'Preencha nome, preço e estoque com valores válidos.';
        $('#addErr').classList.add('show');
        return;
      }
      const data = {
        name,
        category: $('#fCategory').value,
        desc: $('#fDesc').value.trim(),
        top: $('#fTop').value.trim(),
        heart: $('#fHeart').value.trim(),
        base: $('#fBase').value.trim(),
        price,
        size: $('#fSize').value.trim(),
        stock,
        image: uploadedImageData
      };

      if(editingId){
        const idx = products.findIndex(p=>p.id===editingId);
        if(idx > -1){
          products[idx] = { ...products[idx], ...data };
          toast(`"${name}" atualizado com sucesso.`);
        }
        cancelEdit();
      } else {
        products.push({ id:'p'+Date.now(), ...data });
        toast(`"${name}" cadastrado com sucesso.`);
        resetAddForm();
      }
      saveProducts();
      renderAll();
      switchTab('manage');
    });

    $('#newsletterForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      toast('Inscrição confirmada! Você vai receber nossos lançamentos.');
      e.target.reset();
    });

    loadProducts();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();