<?php
/**
 * Roteador para testar o site PRONTO (pasta dist) com o servidor embutido do PHP,
 * imitando o que o .htaccess faz na hospedagem:
 *
 *   php -S localhost:8080 -t dist scripts/router.php
 */

$caminho = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$raiz = $_SERVER['DOCUMENT_ROOT'];

// Pastas internas da API ficam bloqueadas (como na hospedagem)
if (preg_match('#^/api/(lib|private|storage|vendor)(/|$)#', $caminho) || $caminho === '/api/config.php' || $caminho === '/api/config.local.php' || $caminho === '/api/composer.json') {
    http_response_code(403);
    echo 'Proibido';
    return true;
}

// Endereços do site antigo → novos (igual ao .htaccess)
$antigos = ['#^/index\.html$#' => '/', '#^/projetos\.html$#' => '/trabalhos'];
foreach ($antigos as $de => $para) {
    if (preg_match($de, $caminho)) {
        header('Location: ' . $para, true, 301);
        return true;
    }
}

// Arquivos reais (js, css, imagens, /api/*.php) são servidos normalmente
if ($caminho !== '/' && file_exists($raiz . $caminho) && !is_dir($raiz . $caminho)) {
    return false;
}

// Todo o resto é rota do React
header('Content-Type: text/html; charset=utf-8');
readfile($raiz . '/index.html');
return true;
