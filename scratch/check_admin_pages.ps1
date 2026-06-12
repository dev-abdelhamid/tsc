$paths = @('','home','about','success-stories','news','services','faqs','categories','users','companies','jobs','tickets','notifications','contact','settings')
$cookieFile = 'c:\Users\El mostafa\Downloads\new-cvs-main\new-cvs-main\cookiejar.txt'

foreach ($p in $paths) {
  $segment = $p
  $url = "http://localhost:3000/ar/dashboard/admin/$segment"
  Write-Output "=== $url ==="
  $res = & curl.exe -s -o NUL -w "HTTP %{http_code} %{url_effective}`n" -b $cookieFile -L $url
  Write-Output $res
}
