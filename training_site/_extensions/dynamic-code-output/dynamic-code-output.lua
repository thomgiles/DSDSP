-- dynamic-code-output.lua
-- Replace Quarto's R and Python <div class="cell">…</div> with a bare block for pyodide and webr

function CodeBlock(el)
  if el.classes:includes("r") then
    el.classes[1] = "webr"
    io.stderr:write("Converted R -> WebR block\n")
  end
  return el
end

local Attr = pandoc.Attr

local function has_class(el, name)
  if not el or not el.classes then return false end
  for _, c in ipairs(el.classes) do
    if c == name then return true end
  end
  return false
end

-- Depth-first search for the first CodeBlock inside any container
local function find_codeblock(blocks)
  for _, b in ipairs(blocks) do
    if b.t == "CodeBlock" then
      -- allow both "python" and "sourceCode python"
      if has_class(b, "python") then
        return b
      end
    elseif b.t == "Div" then
      local cb = find_codeblock(b.content or {})
      if cb then return cb end
    end
  end
  return nil
end

function Div(el)
  -- Only touch Quarto code cells
  if not has_class(el, "cell") then
    return nil
  end

  local cb = find_codeblock(el.content or {})
  if not cb then
    return nil
  end

  -- Build a NEW bare CodeBlock with the special braced class that pyodide recognises
  -- IMPORTANT: the class is literally "{pyodide-python}"
  local classes = {"{pyodide-python}"}
  return pandoc.CodeBlock(cb.text, Attr("", classes, {}))
end