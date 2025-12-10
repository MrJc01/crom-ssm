<?php
// ====================================================
// CONFIGURAÇÃO BÁSICA
// ====================================================
$siteName = "Crom-SSM";
$pixKey = "d214a3ff-272d-4e57-aaa2-338304e5457e"; // Chave PIX
$pixOwner = "MrJc01"; // Nome do beneficiário
$contactEmail = "mrj.crom@gmail.com";

// Roteamento Simples (Router)
$request = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = rtrim($request, '/');
if ($route === '')
    $route = '/home';

// Função para gerar classe ativa no menu
function isActive($path, $current)
{
    return $path === $current ? 'text-blue-400 font-bold' : 'text-gray-300 hover:text-white';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $siteName; ?> - Gerenciador de Servidores</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a;
            color: #e2e8f0;
        }

        .glass {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .code-block {
            background: #1e293b;
            color: #a5b4fc;
            font-family: monospace;
            padding: 2px 6px;
            border-radius: 4px;
        }
    </style>
</head>

<body class="flex flex-col min-h-screen">

    <!-- NAV -->
    <nav class="border-b border-gray-800 bg-slate-900/80 sticky top-0 backdrop-blur z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="text-2xl font-bold text-white tracking-tighter">
                <i class="fa-solid fa-server text-blue-500 mr-2"></i><?php echo $siteName; ?>
            </div>
            <div class="space-x-6 hidden md:block">
                <a href="/" class="<?php echo isActive('/home', $route); ?> transition">Home</a>
                <a href="/about" class="<?php echo isActive('/about', $route); ?> transition">Sobre</a>
                <a href="/features" class="<?php echo isActive('/features', $route); ?> transition">Funcionalidades</a>
                <a href="/download" class="<?php echo isActive('/download', $route); ?> transition">Download</a>
                <a href="https://github.com/MrJc01/crom-ssm" target="_blank" rel="noopener"
                    class="text-gray-300 hover:text-white transition">
                    <i class="fa-brands fa-github mr-1"></i> Código Fonte
                </a>
                <a href="/donation"
                    class="<?php echo isActive('/donation', $route); ?> px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition shadow-lg shadow-blue-500/30">
                    <i class="fa-solid fa-heart mr-1"></i> Doar
                </a>
            </div>
            <!-- Mobile Menu Button (Simples) -->
            <a href="/donation" class="md:hidden text-blue-400"><i class="fa-solid fa-heart"></i></a>
        </div>
    </nav>

    <!-- CONTENT ROUTER -->
    <main class="flex-grow">

        <?php if ($route === '/home' || $route === '/index.php'): ?>
            <!-- HERO SECTION -->
            <section class="py-20 text-center px-4 bg-gradient-to-b from-slate-900 to-slate-800">
                <h1 class="text-5xl md:text-6xl font-extrabold text-white mb-6">
                    Gerenciamento de Servidores <span class="text-blue-500">Simples</span> e <span
                        class="text-blue-500">Moderno</span>
                </h1>
                <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                    Construído com Electron. Centralize tarefas de DevOps, conexões SSH, monitoramento e edição de arquivos
                    em uma única interface.
                </p>
                <div class="flex justify-center gap-4">
                    <a href="/download"
                        class="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition flex items-center shadow-lg shadow-blue-500/20">
                        <i class="fa-solid fa-download mr-2"></i> Baixar Agora
                    </a>
                </div>

                <!-- APP IMAGES SECTION -->
                <div class="mt-20 max-w-6xl mx-auto">
                    <h2 class="text-2xl font-bold text-white mb-8">Screenshots</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Placeholder Images - Use generate_image to replace later if needed, or user provides -->
                        <div
                            class="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 h-64 flex items-center justify-center">
                            <img src="/image1.png" alt="Dashboard" class="w-full h-full object-cover">
                        </div>
                        <div
                            class="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 h-64 flex items-center justify-center">
                            <img src="/image2.png" alt="Dashboard" class="w-full h-full object-cover">
                        </div>
                        <div
                            class="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 h-64 flex items-center justify-center">
                            <img src="/image3.png" alt="Dashboard" class="w-full h-full object-cover">
                        </div>
                        <div
                            class="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 h-64 flex items-center justify-center">
                            <img src="/image4.png" alt="Dashboard" class="w-full h-full object-cover">
                        </div>
                        <div
                            class="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 h-64 flex items-center justify-center">
                            <img src="/image5.png" alt="Dashboard" class="w-full h-full object-cover">
                        </div>
                    </div>
                </div>
            </section>
        <?php elseif ($route === '/about'): ?>
            <!-- sobre -->
            <section class="max-w-4xl mx-auto py-16 px-4">
                <h2 class="text-3xl font-bold mb-10 text-center">Sobre</h2>
                <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
                    O SSM(Secure Shell Monitor) nasceu da necessidade de reunir, em um único ambiente moderno e eficiente,
                    as principais
                    ferramentas
                    utilizadas no dia a dia de DevOps, administradores de sistemas e profissionais que lidam com múltiplos
                    servidores Linux.
                    A proposta é simplificar o gerenciamento remoto com uma interface leve, reativa e construída com foco em
                    produtividade.
                </p>

                <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
                    O projeto está em evolução constante e meu objetivo é torná-lo cada vez mais completo, robusto e
                    acessível.
                    Conforme o apoio da comunidade cresce, pretendo liberar progressivamente o código-fonte das versões do
                    Crom-SSM,
                    permitindo que mais pessoas possam aprender com o projeto, contribuir com melhorias e até criar suas
                    próprias
                    implementações personalizadas.
                </p>

                <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
                    Todas as melhorias, novas funcionalidades e otimizações planejadas serão desenvolvidas de acordo com os
                    recursos
                    arrecadados por meio de doações. Cada contribuição ajuda a manter o ritmo de desenvolvimento, amplia o
                    alcance do
                    projeto e permite que eu dedique mais tempo para entregar uma experiência ainda melhor para todos os
                    usuários.
                </p>

                <p class="text-xl text-gray-400 max-w-3xl mx-auto">
                    Se você acredita no potencial do Crom-SSM e deseja apoiar sua evolução, qualquer ajuda é bem-vinda.
                    A participação da comunidade é fundamental para que o projeto continue crescendo e ganhe novas versões,
                    mais transparentes e totalmente abertas.
                </p>
            </section>

        <?php elseif ($route === '/features'): ?>
            <!-- FEATURES -->
            <section class="max-w-4xl mx-auto py-16 px-4">
                <h2 class="text-3xl font-bold mb-10 text-center">Principais Funcionalidades</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="glass p-6 rounded-xl">
                        <i class="fa-solid fa-network-wired text-blue-400 text-2xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Gerenciador SSH</h3>
                        <p class="text-gray-400">Salve múltiplas conexões. Suporte a senha e chave privada. Senhas salvas no
                            chaveiro do sistema.</p>
                    </div>
                    <div class="glass p-6 rounded-xl">
                        <i class="fa-solid fa-chart-line text-green-400 text-2xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Dashboard Avançado</h3>
                        <p class="text-gray-400">Métricas em tempo real (CPU, RAM, Disco). Gráficos históricos e monitor de
                            serviços (nginx, docker).</p>
                    </div>
                    <div class="glass p-6 rounded-xl">
                        <i class="fa-solid fa-folder-open text-yellow-400 text-2xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">SFTP & Editor</h3>
                        <p class="text-gray-400">Navegue por arquivos, faça upload/download e edite códigos diretamente no
                            servidor com syntax highlighting.</p>
                    </div>
                    <div class="glass p-6 rounded-xl">
                        <i class="fa-solid fa-terminal text-purple-400 text-2xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Terminal Multi-Abas</h3>
                        <p class="text-gray-400">Terminais persistentes baseados em Xterm.js. Execute snippets salvos com um
                            clique.</p>
                    </div>
                </div>
            </section>

        <?php elseif ($route === '/download'): ?>
            <!-- DOWNLOAD PAGE -->
            <section class="max-w-4xl mx-auto py-16 px-4 text-center">
                <h2 class="text-4xl font-bold mb-6 text-white">Download Crom-SSM</h2>
                <p class="text-xl text-gray-400 mb-12">Escolha a versão compatível com seu sistema operacional.</p>

                <div class="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <!-- Windows -->
                    <div class="glass p-8 rounded-2xl hover:bg-slate-800 transition border border-blue-500/20">
                        <i class="fa-brands fa-windows text-blue-400 text-6xl mb-6"></i>
                        <h3 class="text-2xl font-bold text-white mb-2">Windows</h3>
                        <p class="text-gray-400 mb-6">Versão .exe (Instalador)<br>Compatível com Win 10/11</p>
                        <a href="/Crom-SSM-Setup-1.0.0.exe" download
                            class="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition">
                            <i class="fa-solid fa-download mr-2"></i> Baixar para Windows
                        </a>
                    </div>

                    <!-- Linux -->
                    <div class="glass p-8 rounded-2xl hover:bg-slate-800 transition border border-orange-500/20">
                        <i class="fa-brands fa-linux text-orange-400 text-6xl mb-6"></i>
                        <h3 class="text-2xl font-bold text-white mb-2">Linux</h3>
                        <p class="text-gray-400 mb-6">Versão .AppImage<br>Ubuntu, Debian, Fedora</p>
                        <a href="/Crom-SSM-1.0.0.AppImage" download
                            class="block w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition">
                            <i class="fa-solid fa-download mr-2"></i> Baixar para Linux
                        </a>
                    </div>
                </div>

                <div class="mt-12 text-gray-500 text-sm">
                    <p>Versão Atual: 1.0.0 (Beta)</p>
                </div>
            </section>

        <?php elseif ($route === '/donation'): ?>
            <!-- DONATION PAGE -->
            <section class="max-w-2xl mx-auto py-16 px-4">
                <div
                    class="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl border border-blue-500/30 text-center">
                    <h2 class="text-3xl font-bold mb-4 text-white"><i class="fa-brands fa-pix text-teal-400"></i> Apoie o
                        Projeto</h2>
                    <p class="text-blue-200 mb-8">Ajude a manter o desenvolvimento do Crom-SSM ativo. Sua doação é
                        essencial!</p>

                    <div class="bg-white p-4 inline-block rounded-lg mb-6 shadow-inner">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=<?php echo urlencode($pixKey); ?>"
                            alt="QR Code PIX" class="w-56 h-56">
                    </div>

                    <div class="space-y-4">
                        <p class="text-sm text-gray-400">Chave PIX (Aleatória):</p>
                        <div class="flex items-center justify-center gap-2 max-w-md mx-auto">
                            <code id="pixKeyDisplay"
                                class="bg-slate-800 px-4 py-3 rounded-lg text-lg select-all text-teal-300 break-all border border-slate-700"><?php echo $pixKey; ?></code>
                        </div>
                        <button onclick="copyPix()" class="text-blue-400 hover:text-white underline text-sm transition">
                            <i class="fa-regular fa-copy mr-1"></i> Copiar Chave
                        </button>
                    </div>
                </div>
            </section>

            <script>
                function copyPix() {
                    const key = document.getElementById('pixKeyDisplay').innerText;
                    navigator.clipboard.writeText(key).then(() => alert('Chave PIX copiada!'));
                }
            </script>

        <?php else: ?>
            <!-- 404 -->
            <div class="text-center py-20">
                <h1 class="text-4xl font-bold">404</h1>
                <p>Página não encontrada.</p>
                <a href="/" class="text-blue-400 hover:underline">Voltar para Home</a>
            </div>
        <?php endif; ?>
    </main>

    <!-- FOOTER -->
    <footer class="border-t border-gray-800 bg-slate-900 py-8 text-center text-gray-500 text-sm">
        <p>&copy; <?php echo date('Y'); ?> <a href="https://crom.run">crom.run</a>. Todos os direitos reservados.</p>
        <p class="mt-2">Código fonte: <a class="text-blue-400 hover:text-blue-200" href="https://github.com/MrJc01/crom-ssm" target="_blank" rel="noopener">github.com/MrJc01/crom-ssm</a></p>
    </footer>

</body>

</html>