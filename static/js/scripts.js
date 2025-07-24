

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['research-intro', 'people', 'progress', 'achievements', 'resources']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
                
                // PDF 뷰어 기능 추가 (자료실 페이지인 경우)
                if (name === 'resources') {
                    setupPdfViewer();
                }
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 

// PDF 뷰어 기능
function setupPdfViewer() {
    const resourcesSection = document.getElementById('resources-md');
    if (!resourcesSection) return;

    // PDF 뷰어 컨테이너 생성
    const pdfViewer = document.createElement('div');
    pdfViewer.className = 'pdf-viewer';
    pdfViewer.innerHTML = `
        <div class="pdf-container">
            <button class="pdf-close-btn" onclick="closePdfViewer()">&times;</button>
            <iframe class="pdf-iframe" id="pdf-iframe"></iframe>
        </div>
    `;
    
    // PDF 뷰어를 페이지에 추가
    resourcesSection.appendChild(pdfViewer);

    // 모든 문서 링크에 이벤트 리스너 추가
    const docLinks = resourcesSection.querySelectorAll('a[href*=".pdf"], a[href*=".txt"]');
    docLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const docUrl = this.getAttribute('href');
            openPdfViewer(docUrl, this.textContent);
        });
    });
}

function openPdfViewer(pdfUrl, title) {
    const pdfViewer = document.querySelector('.pdf-viewer');
    const pdfIframe = document.getElementById('pdf-iframe');
    
    if (pdfViewer && pdfIframe) {
        pdfIframe.src = pdfUrl;
        pdfViewer.classList.add('active');
        
        // 페이지 제목 업데이트
        const viewerTitle = document.createElement('h3');
        viewerTitle.textContent = title;
        viewerTitle.style.margin = '10px 0';
        viewerTitle.style.color = '#3948d2';
        
        // 기존 제목이 있다면 제거
        const existingTitle = pdfViewer.querySelector('h3');
        if (existingTitle) {
            existingTitle.remove();
        }
        
        pdfViewer.insertBefore(viewerTitle, pdfViewer.firstChild);
        
        // 스크롤을 뷰어로 이동
        pdfViewer.scrollIntoView({ behavior: 'smooth' });
    }
}

function closePdfViewer() {
    const pdfViewer = document.querySelector('.pdf-viewer');
    const pdfIframe = document.getElementById('pdf-iframe');
    
    if (pdfViewer && pdfIframe) {
        pdfViewer.classList.remove('active');
        pdfIframe.src = '';
        
        // 제목 제거
        const title = pdfViewer.querySelector('h3');
        if (title) {
            title.remove();
        }
    }
}
