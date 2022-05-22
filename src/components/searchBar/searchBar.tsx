import styles from './searchBar.module.css'

export default function searchBar() {
  return (
      <input type="search" name="search" id={styles.search} placeholder="find an ambassador"/>
  )
}
