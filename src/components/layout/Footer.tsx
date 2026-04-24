const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <img src="/assets/chat2.svg" alt="" className="brand-mark" />
              <div>
                <div className="name" style={{ color: '#fff' }}>
                  MokshPath <span style={{ color: 'var(--saffron-soft)' }}>Academia</span>
                </div>
                <div className="tag">a guided path to true learning</div>
              </div>
            </div>
            <p style={{ color: '#9FA5C2', fontSize: '0.9rem', maxWidth: 320 }}>
              A MokshPath initiative. Building thoughtful, dharmically-grounded learning
              technology for schools and families across India.
            </p>
            <div
              style={{
                fontFamily: 'var(--ff-devanagari)',
                color: 'var(--saffron-soft)',
                fontSize: '1rem',
                marginTop: 8,
              }}
            >
              सत्यमेव जयते · विद्या ददाति विनयम्
            </div>
          </div>

          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <a href="/#personas">Who it's for</a>
              </li>
              <li>
                <a href="/#how">How it works</a>
              </li>
              <li>
                <a href="/#pricing">Subscription</a>
              </li>
              <li>
                <a href="/#proof">Success stories</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>For</h4>
            <ul>
              <li>
                <a href="/#tab-student">Students</a>
              </li>
              <li>
                <a href="/#tab-parent">Parents</a>
              </li>
              <li>
                <a href="/#tab-teacher">Teachers</a>
              </li>
              <li>
                <a href="/#tab-institution">Institutions</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Blogs</a>
              </li>
              <li>
                <a href="#">Help center</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="bottom">
          <div>© 2026 MokshPath Academia. Made with care in India.</div>
          <div>
            <a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Data policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
