import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa6"
import "./Footer.css"

export default function Footer() {
  return (
    <footer className="footer">
      <a
        href="mailto:irenealcainealvarez@gmail.com"
        aria-label="Correo electrónico"
        title="Correo electrónico"
      >
        <FaEnvelope />
      </a>
      <a
        href="https://www.linkedin.com/in/irenealcaine/"
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <FaLinkedin />
      </a>
      <a
        href="https://github.com/irenealcaine"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        title="GitHub"
      >
        <FaGithub />
      </a>
    </footer>
  )
}
