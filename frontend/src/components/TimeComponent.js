const TimeComponent = ({ timestamp }) => {

    const date = new Date(timestamp);
    const localTimeString = date.toLocaleString();
    const difference = date.getTime() - Date.now();
    const differenceInDays = Math.ceil(difference / (1000 * 60 * 60 * 24));

    let title = '';
    if (differenceInDays > 0) {
      title = `In ${differenceInDays} day${differenceInDays !== 1 ? 's' : ''}`;
    } else if (differenceInDays === 0) {
      title = 'Today';
    } else {
      title = `${-differenceInDays} day${differenceInDays !== -1 ? 's' : ''} ago`;
    }

    return <span title={title}>{localTimeString}</span>;
  };

export default TimeComponent;
