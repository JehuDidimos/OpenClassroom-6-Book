/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../../lib/customHooks';
import styles from './Book.module.css';
import { getBook, deleteBook } from '../../lib/common';
import BookInfo from '../../components/Books/BookInfo/BookInfo';
import BookRatingForm from '../../components/Books/BookRatingForm/BookRatingForm';
import BookDeleteImage from '../../images/book_delete.png';
import BestRatedBooks from '../../components/Books/BestRatedBooks/BestRatedBooks';
import BackArrow from '../../components/BackArrow/BackArrow';

function Book() {
  const { connectedUser, userLoading } = useUser();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [userRated, setUserRated] = useState(false);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    async function getItem() {
      console.log(params.id);
      const data = await getBook(params.id);
      if (data) {
        console.log(data);
        setBook(data);
      }
    }
    getItem();
  }, [params.id]);

  useEffect(() => {
    console.log(book);
    console.log(userLoading);
    if (!userLoading && connectedUser && book?.data?.title) {
      const rate = book.data.ratings.find((elt) => elt.userId === connectedUser.userId);
      if (rate) {
        setUserRated(true);
        setRating(parseInt(rate.grade, 10));
        setLoading(false);
      } else {
        setUserRated(false);
        setRating(0);
        setLoading(false);
      }
    } else if (!userLoading && !connectedUser && book) {
      setLoading(false);
    }
  }, [book, userLoading]);

  const onDelete = async (e) => {
    if (e.key && e.key !== 'Enter') {
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    const check = confirm('Etes vous sûr de vouloir supprimer ce livre ?');
    if (check) {
      const del = await deleteBook(book.data.id);
      if (del) {
        setBook((oldValue) => ({ ...oldValue, delete: true }));
      }
    }
  };

  const loadingContent = (<h1>Chargement ...</h1>);

  const bookContent = !loading && !book.delete ? (
    <div>
      <div className={styles.Book}>
        <div className={styles.BookImage} style={{ backgroundImage: `url("${book?.data?.imageUrl}")` }} />
        <div className={styles.BookContent}>
          {book?.data?.userId === connectedUser?.userId ? (
            <div className={styles.Owner}>
              <p>Vous avez publié cet ouvrage, vous pouvez le :</p>
              <p>
                <Link to={`/livre/modifier/${book.data.id}`}>modifier</Link>
                {' '}
                <span tabIndex={0} role="button" onKeyUp={onDelete} onClick={onDelete}>supprimer</span>
                {' '}
              </p>
            </div>
          ) : null}
          <BookInfo book={book.data} />
          <BookRatingForm
            userRated={userRated}
            userId={connectedUser?.userId}
            rating={rating}
            setRating={setRating}
            setBook={setBook}
            id={book?.data?.id}
          />
        </div>
      </div>
      <hr />
      <BestRatedBooks />
    </div>
  ) : null;
  const deletedContent = book?.delete ? (
    <div className={styles.Deleted}>
      <h1>{book.data.title}</h1>
      <p>a bien été supprimé</p>
      <img src={BookDeleteImage} alt={`Le livre ${book.data.title} a bien été supprimé`} />
      <Link to="/">
        <button type="button">{'Retour à l\'accueil'}</button>
      </Link>
    </div>
  ) : null;

  return (
    <div className="content-container">
      <BackArrow />
      {loading ? loadingContent : null}
      <div className={styles.BookContainer}>
        {bookContent}
      </div>
      {book?.delete ? deletedContent : null}

    </div>
  );
}
export default Book;
