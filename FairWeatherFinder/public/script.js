$(document).ready(() => {
  console.log('script loaded');


$('#editProfileForm').on('submit', e => {
    e.preventDefault();

   const id = $('#editHeader').attr('class'),
          hiTemp = $('#hiTemp').val(),
          loTemp = $('#loTemp').val(),
          precipitation = $('#precipitation').val(),
          humidity = $('#humidity').val(),
          maxWind = $('#windConditions').val(),
          cloudConditions = $('#cloudConditions').val();

    const editedProfileData = {
      id: id, 
      hiTemp: hiTemp, 
      loTemp: loTemp, 
      precipitation: precipitation, 
      maxWind: maxWind,
      humidity: humidity,
      cloudConditions: cloudConditions
    };

    console.log(editedProfileData);

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

$('#deleteButton').on('click', e => {
  e.preventDefault();
  console.log('deleting profile');

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
});