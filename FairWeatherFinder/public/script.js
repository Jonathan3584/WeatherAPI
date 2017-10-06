$(document).ready(() => {
  console.log('script loaded');

//Ajax call to run PUT route on editing existing weather profile
$('#editProfileForm').on('submit', e => {
    e.preventDefault();
   const id = $('#editHeader').attr('class'),
          hiTemp = $('#hiTemp').val(),
          loTemp = $('#loTemp').val(),
          precipitation = $('#precipitation').val(),
          humidity = $('#humidity').val(),
          maxWind = $('#maxWind').val(),
          cloudCover = $('#cloudCover').val();
    const editedProfileData = {
      id: id, 
      hiTemp: hiTemp, 
      loTemp: loTemp, 
      precipitation: precipitation, 
      maxWind: maxWind,
      humidity: humidity,
      cloudCover: cloudCover
    };
    $.ajax({
      method: 'PUT',
      url: `/climate/profiles/${id}/edit`,
      data: editedProfileData,
      success: response => {
        console.log(response);
        window.location.replace(`/climate/profiles/${id}`)
      }, error: msg => {
        console.log(msg);
      }
    });

});
//Ajax call to run DELETE route on weather profile
$('#deleteButton').on('click', e => {
  e.preventDefault();
  $.ajax({
    method: 'DELETE',
    url: $(this).data('url'),
    success: response => {
      window.location.replace('/climate/')
    }, error: msg => {
      console.log(msg);
    }
    });
});
//Ajax call to retrieve and format address data from query form 
$('#queryFormAdd').on('submit', e => {
    e.preventDefault();
    const id = $('#addressHeader').attr('class');
    const addressInput = $('#addressInput').val();
    readableAddress = {address: addressInput.replace(/ /g, '+')};
    console.log(readableAddress);
    $.ajax({
      method: 'POST',
      url: `/climate/profiles/${id}/query/`,
      data: readableAddress,
      success: response => {
        window.location.replace(`/climate/profiles/${id}/query/2`)
      }, error: msg => {
        console.log('AJAX called failed', msg);
      }
    });

});
//Ajax call to retrieve and format date from query form
$('#queryFormDate').on('submit', e => {
    e.preventDefault();
    const id = $('#dateHeader').attr('class');
    const dates = {startDate: $('#startDateInput').val(),
                  endDate: $('#endDateInput').val()};
    console.log(dates);
    $.ajax({
      method: 'POST',
      url: `/climate/profiles/${id}/query/2`,
      data: dates,
      success: response => {
        window.location.replace(`/climate/profiles/${id}/results`)
      }, error: msg => {
        console.log('AJAX called failed', msg);
      }
    });

});



















});