-- Rewrite {python} fences to {pyodide-python} before render, backing up originals.
local input = os.getenv("QUARTO_PROJECT_INPUT_FILES")
if not input or #input == 0 then os.exit() end

-- Track which files we touched so we can restore later.
local list_path = ".quarto/pyodide-bak.list"
os.execute("mkdir -p .quarto")
local list = assert(io.open(list_path, "w"))

for path in string.gmatch(input, "[^\n]+") do
  local f = io.open(path, "r")
  if f then
    local txt = f:read("*a"); f:close()

    -- Only touch files that actually contain python fences.
    if txt:match("```%s*%{python") or txt:match("\n```%s*python%s*\n") then
      -- Backup original
      os.rename(path, path .. ".bak")
      list:write(path, "\n")

      -- Convert {python ...} -> {pyodide-python ...}
      txt = txt:gsub("```%s*%{python([^\n}]*)%}", "```{pyodide-python%1}")
      -- Convert ```python -> ```{pyodide-python}
      txt = txt:gsub("\n```%s*python%s*\n", "\n```{pyodide-python}\n")

      local w = assert(io.open(path, "w"))
      w:write(txt); w:close()
    end
  end
end
list:close()
