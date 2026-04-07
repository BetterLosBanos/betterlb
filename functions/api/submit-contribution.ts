export const onRequestPost: PagesFunction = async () => {
  return Response.json(
    {
      error: 'This endpoint is deprecated. Please use the contribute form.',
      contribute_url: 'https://betterlb.org/contribute',
    },
    { status: 410 }
  );
};
