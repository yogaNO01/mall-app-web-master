export const copyText = async (text: string): Promise<boolean> => {
  try { await navigator.clipboard.writeText(text); return true } catch { /* LAN HTTP and older browsers use the fallback below. */ }
  const input = document.createElement('textarea')
  const active = document.activeElement as HTMLElement | null
  input.value = text
  input.setAttribute('readonly','')
  input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;'
  document.body.append(input)
  input.select()
  input.setSelectionRange(0,text.length)
  try { return document.execCommand('copy') }
  catch { return false }
  finally { input.remove(); active?.focus({ preventScroll:true }) }
}
