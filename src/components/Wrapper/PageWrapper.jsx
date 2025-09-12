import { motion, AnimatePresence } from "framer-motion";


const variants = {
  initial: { opacity: 0, y: 20 },    // Page bắt đầu ẩn, hơi lệch xuống
  animate: { opacity: 1, y: 0 },     // Page hiển thị mượt
  exit: { opacity: 0, y: -20 },      // Page rời đi hơi lệch lên
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4 }}   // Thời gian 0.4s
  >
    {children}
  </motion.div>
);

export default PageWrapper;
