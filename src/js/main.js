import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const search_form = document.querySelector('form.search-form');
search_form.addEventListener('submit', form_Submit);

const lightBox = new SimpleLightbox('ul.gallery .image-card', {
  captionsData: 'alt',
  captionDelay: 250,
});

const images_list = document.querySelector('ul.gallery');
const loadMoreButton = document.querySelector('.load-more-button');
loadMoreButton.addEventListener('click', loadMoreButton_Click);

setAxiosDefaults();
let page_number;
let previousUserQuery;

async function form_Submit(event) {
  event.preventDefault();

  const userQuery = getUserInput();
  clearFields();
  if (userQuery !== previousUserQuery) {
    await search(userQuery);
  }
}

async function search(userQuery) {
  clearGallery();
  page_number = 1;
  previousUserQuery = userQuery;
  await downloadImages();

  setHeightToScrollBy();
}

let heightToScrollBy = 0;

function setHeightToScrollBy() {
  const card = images_list.querySelector('ul.gallery li');
  const cardHeight = card.getBoundingClientRect().height;
  heightToScrollBy = cardHeight * 2 + 24;
}

let totalHits;
const imagesPerPage = 40;

async function downloadImages() {
  hideLoadMoreButton();
  showLoader();
  let images;
  const options = createFetchOptions(previousUserQuery);
  try {
    const data = await fetchData(options);
    page_number++;
    images = getImagesFromData(data);
    totalHits = getTotalHits(data);
  } catch (error) {
    showErrorMessage(error.message);
  }

  hideLoader();

  updatePage(images);
}

function updatePage(images) {
  if (images.length > 0) {
    createGallery(images);

    if (checkIfThereAreImagesLeftOnBackEnd()) {
      showLoadMoreButton();
    } else {
      showInfoMessage(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } else {
    showErrorMessage(
      'Sorry, there are no images matching your search query. Please try again!'
    );
  }
}

function showInfoMessage(message) {
  const options = {
    message,
    messageColor: '#FFFFFF',
    backgroundColor: '#a3daf9',
    position: 'topRight',
    transitionIn: 'fadeIn',
    animateInside: false,
    timeout: 2500,
    maxWidth: '432px',
  };
  iziToast.info(options);
}

function checkIfThereAreImagesLeftOnBackEnd() {
  // console.clear();
  // console.log("total hits", totalHits);
  // console.log("images per page", imagesPerPage);
  const totalPages = Math.ceil(totalHits / imagesPerPage);
  // console.log("total pages:", totalPages);
  // console.log("page_number:", page_number);
  return page_number - 1 < totalPages;
}

function getTotalHits(data) {
  return data.data.totalHits;
}

function getImagesFromData(data) {
  return data.data.hits;
}

function setAxiosDefaults() {
  axios.defaults.baseURL = 'https://pixabay.com/api';
}

async function fetchData(options) {
  return await axios.get('/?', { params: options });
}

function clearGallery() {
  images_list.innerHTML = '';
}

function createFetchOptions(userQuery) {
  return {
    q: userQuery,
    key: '41477668-72105b12976de46dadf21c706',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: imagesPerPage,
    page: page_number,
  };
}

function getUserInput() {
  return document.querySelector('input.search-textbox').value;
}

function clearFields() {
  search_form.reset();
}

function showErrorMessage(message) {
  const options = {
    message,
    messageColor: '#FFFFFF',
    backgroundColor: '#fe4a40',
    position: 'topRight',
    transitionIn: 'fadeIn',
    animateInside: false,
    timeout: 2500,
    iconUrl: './img/error.svg',
    maxWidth: '432px',
    progressBarColor: '#B51B1B',
  };
  iziToast.error(options);
}

function createGallery(images) {
  const markup = createGalleryMarkup(images);
  images_list.insertAdjacentHTML('beforeend', markup);
  lightBox.refresh();
}

function createGalleryMarkup(images) {
  return images.map(image => createImageMarkup(image)).join('');
}

function createImageMarkup(image) {
  return `<li class="gallery-item">
    <a class="image-card" href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${
    image.tags
  }" width="360" height="200" style="fit-content: cover"/>
    </a>
        ${createImageInfoCardMarkup(image)}
    </li>`;
}

function createImageInfoCardMarkup(image) {
  return `<ul class="list image-info-card">
            ${createImagePropertyMarkup('Likes', image.likes)}
            ${createImagePropertyMarkup('Views', image.views)}
            ${createImagePropertyMarkup('Comments', image.comments)}
            ${createImagePropertyMarkup('Downloads', image.downloads)}
        </ul>`;
}

function createImagePropertyMarkup(propertyName, propertyValue) {
  return `<li class="image-property">
                <h3 class="image-property-title">${propertyName}</h3>
                <span class="image-property-value">${propertyValue}</span>
            </li>`;
}

const loader = document.querySelector('.loader');

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'inline';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function scrollPageDown() {
  window.scrollBy({
    top: heightToScrollBy,
    behavior: 'smooth',
  });
}

async function loadMoreButton_Click() {
  await downloadImages();
  scrollPageDown();
}

search('');
