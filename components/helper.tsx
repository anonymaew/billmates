export const DateText = ({ date }: { date: Date }) => {
  return <span>{
    date
      .toUTCString()
      .split(' ')
      .slice(0, 4)
      .join(' ')
    } </span>;
};
