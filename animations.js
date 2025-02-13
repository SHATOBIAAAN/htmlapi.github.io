document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section')
    const portfolioItems = document.querySelectorAll('.portfolio-item')

    const observerOptions = {
        threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
                observer.unobserve(entry.target)
            }
        })
    }, observerOptions)

    sections.forEach(section => {
        observer.observe(section)
    })

    portfolioItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.2}s`
        observer.observe(item)
    })

    const canvas = document.getElementById('interactiveBackground')
    const ctx = canvas.getContext('2d')
    let particles = []

    const particleSettings = {
        count: 100,
        maxSpeed: 0.5,
        mouseInfluence: 0.1,
    }

    function init() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        particles = Array.from({ length: particleSettings.count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * particleSettings.maxSpeed,
            dy: (Math.random() - 0.5) * particleSettings.maxSpeed,
            size: Math.random() * 2 + 1,
        }))
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach(particle => {
            particle.x += particle.dx
            particle.y += particle.dy

            if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1
            if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1

            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(33,150,243,${0.5})`
            ctx.fill()
        })

        requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', e => {
        particles.forEach(particle => {
            const dx = e.clientX - particle.x
            const dy = e.clientY - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
                particle.dx += (dx / distance) * particleSettings.mouseInfluence
                particle.dy += (dy / distance) * particleSettings.mouseInfluence
            }
        })
    })

    init()
    animate()
    window.addEventListener('resize', init)

    class MatrixBackground {
        constructor() {
            this.canvas = document.getElementById('matrixBackground')
            this.ctx = this.canvas.getContext('2d')
            this.symbols = '01'
            this.columns = []
            this.mouse = { x: 0, y: 0 }

            this.init()
            this.animate()
        }

        init() {
            this.resize()
            window.addEventListener('resize', () => this.resize())
            window.addEventListener('mousemove', e => {
                this.mouse.x = e.clientX
                this.mouse.y = e.clientY
            })

            for (let i = 0; i < this.canvas.width / 20; i++) {
                this.columns[i] = {
                    y: Math.random() * -this.canvas.height,
                    speed: Math.random() * 2 + 1,
                }
            }
        }

        resize() {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
        }

        draw() {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            this.ctx.fillStyle = '#0F0'
            this.ctx.font = '14px monospace'

            this.columns.forEach((col, i) => {
                const char =
                    this.symbols[
                        Math.floor(Math.random() * this.symbols.length)
                    ]
                const x = i * 20
                const y = col.y

                const dx = this.mouse.x - x
                const dy = this.mouse.y - y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 150) {
                    col.y += (dy / distance) * 2
                    col.x += (dx / distance) * 2
                }

                this.ctx.fillText(char, x, y)

                if (col.y > this.canvas.height) {
                    col.y = Math.random() * -this.canvas.height
                } else {
                    col.y += col.speed
                }
            })
        }

        animate() {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            this.draw()
            requestAnimationFrame(() => this.animate())
        }
    }

    new MatrixBackground()
})
