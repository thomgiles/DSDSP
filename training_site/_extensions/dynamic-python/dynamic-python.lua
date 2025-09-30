function CodeBlock(el)
  if el.attr and el.attr.classes then
    local cls = el.attr.classes[1]
    if cls == "r" then
      -- Rewrite R -> webr
      el.attr.classes[1] = "webr"
      io.stderr:write("Converted R -> WebR block\n")
    elseif cls == "python" then
      -- Rewrite Python -> pyodide-python
      el.attr.classes[1] = '{pyodide-python}'
      io.stderr:write("Converted Python -> Pyodide block\n")
    end
  end
  return el
end

function Div(el)
  -- look for Quarto code cells
  if el.classes:includes('cell') and #el.content == 1 then
    local inner = el.content[1]
    if inner.t == 'CodeBlock' and inner.classes:includes('python') then
      -- replace whole Div with a bare CodeBlock
      return pandoc.CodeBlock(
        inner.text,
        pandoc.Attr("", {"pyodide-python"}, {})
      )
    end
  end
  return el
end