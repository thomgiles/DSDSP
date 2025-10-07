-- episodes-footer.lua
-- Ensure the RevealJS footer prepends a link back to the article HTML
-- Works even if the footer is created after DOMContentLoaded.

local function strip_ext(filename)
  return filename:gsub("%.%w+$", "")
end

-- Append a RawBlock to include-after-body without clobbering existing entries
local function append_include_after_body(meta, block)
  local v = meta["include-after-body"]
  if v == nil then
    meta["include-after-body"] = pandoc.MetaBlocks({ block })
    return
  end
  if v.t == "MetaBlocks" then
    -- MetaBlocks is a list of Blocks
    local blocks = v
    blocks[#blocks + 1] = block
    meta["include-after-body"] = blocks
    return
  end
  if v.t == "MetaList" then
    table.insert(v, pandoc.MetaBlocks({ block }))
    meta["include-after-body"] = v
    return
  end
  -- Otherwise, normalise to a MetaList
  meta["include-after-body"] = pandoc.MetaList{ v, pandoc.MetaBlocks({ block }) }
end

function Meta(meta)
  -- only for revealjs renders (skip html/pdf/commonmark)
  local is_reveal = meta.format and meta.format.revealjs ~= nil
  if not is_reveal then return meta end

  -- input file → same-dir basename .html
  local input_file = nil
  if meta.quarto and meta.quarto.doc and meta.quarto.doc.input_file then
    input_file = pandoc.utils.stringify(meta.quarto.doc.input_file)
  end
  if not input_file then return meta end

  local base = strip_ext(pandoc.path.basename(input_file))
  local htmlfilename = base .. ".html"

  -- robust JS: wait for Reveal, then patch; also watch DOM if needed
  local js = string.format([[
<script>
(function(){
  function setFooter(){
    // try several selectors used by Quarto/Reveal
    var p = document.querySelector('.reveal .footer p') ||
            document.querySelector('.footer.footer-default p') ||
            document.querySelector('.reveal .footer');
    if (!p) return false;
    var existing = (p.textContent || '').trim();
    var html = '<a href="%s">Return to Article View</a>';
    if (existing) html += ' | ' + existing;
    p.innerHTML = html;
    return true;
  }

  function trySetFooter(){
    if (setFooter()) return;
    // observe until footer appears
    var mo = new MutationObserver(function(){
      if (setFooter()) mo.disconnect();
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }

  if (window.Reveal && typeof window.Reveal.on === 'function') {
    window.Reveal.on('ready', function(){ setTimeout(trySetFooter, 0); });
  } else {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(trySetFooter, 0); });
  }
})();
</script>
]], htmlfilename)

  append_include_after_body(meta, pandoc.RawBlock('html', js))
  return meta
end
