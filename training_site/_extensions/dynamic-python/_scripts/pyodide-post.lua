-- Restore any files we modified in pre-render.
local list_path = ".quarto/pyodide-bak.list"
local list = io.open(list_path, "r")
if not list then os.exit() end

for path in list:lines() do
  -- If something failed mid-run, be forgiving.
  local bak = path .. ".bak"
  local f = io.open(bak, "r")
  if f then f:close(); os.remove(path); os.rename(bak, path) end
end
list:close()
os.remove(list_path)
