<script setup>
</script>

<template>
  <div class="StyleTestView">
    <h1 class="PageHeader">Styles Test</h1>
    <div class="StyleSection">
      <h1>Hello World H1</h1>
      <h2>Alice H2</h2>
      <p>kjfkldsajlf ksjkl jf asdljfklj saf jlksadj jsaldj ljs lfkasjl k jfalk j las j</p>
      <p>djksl dsj  aslkdj l ljasdj lf sjlkasdj lksl kdjd sljf as lasj lfj flsjd l lkasj</p>
      <h2>Bob H2</h2>
      <p>dfjl fj lksaj jdslk j lkjdsalkj kljasl jfsj klfjlskadj jlsa djflj klsj lkfjsal </p>
      <p>dsjklf asj lkfjsad jfsdj lksdaj lkfjasj kljf sakljf lsajf lkasj lkfjs jlfj</p>
      <h3>Lol H3</h3>
      <p>  jalsj jasdklj fljl jfklsaj fljsa  jdslkjf lasj fkljas</p>
      <h4>Moo H4</h4>
      <p>j flsdaj ljasdfl jdsljkl fjsd jljfl kjdsaklj fla jlsjf ljf sdaljl</p>
      <p>kjfkldsajlf ksjkl jf asdljfklj saf jlksadj jsaldj ljs lfkasjl k jfalk j las j</p>
      <p>djksl dsj  aslkdj l ljasdj lf sjlkasdj lksl kdjd sljf as lasj lfj flsjd l lkasj</p>
      <h4>Goo H4</h4>
      <p>j flsdaj ljasdfl jdsljkl fjsd jljfl kjdsaklj fla jlsjf ljf sdaljl</p>
      <p>kjfkldsajlf ksjkl jf asdljfklj saf jlksadj jsaldj ljs lfkasjl k jfalk j las j</p>
      <p>djksl dsj  aslkdj l ljasdj lf sjlkasdj lksl kdjd sljf as lasj lfj flsjd l lkasj</p>
    </div>
    <div class="StyleSection">
      <div class="TestInput">
        <h3 class="Header">Title</h3>
        <p>Hello World</p>
        <div class="Footer">
          <button>Cancel</button>
          <button>Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.StyleSection {
  margin-bottom: var(--space-xl);
}

.TestInput {
  border: 1px solid var(--main-text);
  border-radius: var(--border-radius-med);
  padding: 16px;
  background-color: var(--popup-bg);
  width: 500px;
}

.TestInput .Header {
  margin-bottom: var(--space-m);
}

.TestInput .Footer {
  margin-top: var(--space-m);
  display: flex;
  flex-flow: row nowrap;
  justify-content: end;
}

.Footer button {
  margin-right: var(--space-xs);
}

.Footer button:last-child {
  margin-right: 0;  
}

</style>
